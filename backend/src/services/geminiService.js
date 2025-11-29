import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
if (!GEMINI_API_KEY) { console.warn("Warning: GEMINI_API_KEY is missing in .env"); }

// Switched back to 'gemini-pro' as 'gemini-1.5-flash' was giving 404s for you
// Delete the hardcoded string entirely
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SCHEMA_CONTEXT = `
Database Schema for college-management (PostgreSQL):

TABLES & COLUMNS:
1. student (student_id, usn, name, email, department_id, address) -- Removed 'phone' to avoid error
2. faculty (faculty_id, faculty_name, email, department_id) -- Removed 'phone' to avoid error
3. department (department_id, department_name)
4. marks_student (mark_id, student_id, student_name, semester, subject_code, subject_name, internal_marks, external_marks, total_marks, result)
5. faculty_courses (course_id, faculty_id, course_name, subject_code, semester, academic_year)
6. department_circulars (circular_id, department_id, title, circular_details)
7. student_leave_requests (leave_id, student_id, leave_details, status, from_date)
8. department_activities (event_id, department_id, event_title, event_date)

RELATIONSHIPS:
- Student -> Dept: student.department_id = department.department_id
- Faculty -> Dept: faculty.department_id = department.department_id
- Faculty -> Courses: faculty.faculty_id = faculty_courses.faculty_id

ROLE RULES:
- STUDENT: RESTRICTED. Can ONLY see their own data. MUST use "WHERE student_id = $1".
- FACULTY: RESTRICTED. Can ONLY see their own data. MUST use "WHERE faculty_id = $1" (or join on it).
- DEPARTMENT: FULL ACCESS. Can see all students and faculty. Do NOT use parameters like $1.
- ADMIN: FULL ACCESS. Can see all tables. Do NOT use parameters like $1.

ENUMS (Use EXACTLY these lowercase values):
- status: 'approved', 'pending', 'rejected'
- result: 'pass', 'fail'
`;

export const generateSQL = async (userQuery, userRole, userId) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    // SIMPLIFIED PROMPTS
    const roleInstructions = {
      // STRICT RESTRICTIONS
      student: `You are a STUDENT (ID: ${userId}). You are strictly limited to your own data. ALWAYS add "WHERE student_id = $1".`,
      faculty: `You are a FACULTY member (ID: ${userId}). You are strictly limited to your own records. ALWAYS add "WHERE faculty_id = $1" for personal/course data.`,
      
      // REMOVED RESTRICTIONS
      department: `You are a DEPARTMENT HEAD. You have access to ALL student and faculty data. Do NOT use $1. Generate standard SQL without ID filters.`,
      admin: `You are an ADMIN. You have access to EVERYTHING. Do NOT use $1. Generate standard SQL without ID filters.`
    };

    const prompt = `
${SCHEMA_CONTEXT}

${roleInstructions[userRole] || roleInstructions.admin}

User Query: "${userQuery}"

Generate a valid PostgreSQL SELECT query.
Rules:
1. Output ONLY the raw SQL. No markdown.
2. If the user says "Hi", "Hello" or asks non-data questions, output exactly: NON_SQL_INTENT
3. Use lowercase for enums ('pending', 'approved').
4. Use CURRENT_DATE for date comparisons.

SQL:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let sql = response.text().trim();

    sql = sql.replace(/```sql/g, '').replace(/```/g, '').trim();
    return sql;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('AI Service Failed: ' + error.message);
  }
};

export const formatResponse = async (userQuery, sql, results, userRole) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    You are a helper bot explaining database results to a user with role: ${userRole.toUpperCase()}.

    User Question: "${userQuery}"
    SQL Executed: "${sql}"
    Row Count: ${results.length}
    Data Preview: ${JSON.stringify(results.slice(0, 3))}

    INSTRUCTIONS:
    1. If Row Count is > 0: Summarize the data friendly (e.g., "Here are the 5 students found.").
    
    2. If Row Count is 0 (CRITICAL):
       - Analyze the User Question vs. their Role.
       - If a STUDENT asked for Faculty/Department/Admin data: Reply exactly "You do not have access to this data."
       - If a FACULTY asked for other Faculty's data: Reply exactly "You do not have access to this data."
       - If the query was valid but just empty (e.g., "My marks" but no marks exist): Reply "No data available for this request."
    
    Keep the response brief and natural.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    // Fallback if AI fails
    if (results.length === 0) return "No data available or access restricted.";
    return `Found ${results.length} record(s).`;
  }
};