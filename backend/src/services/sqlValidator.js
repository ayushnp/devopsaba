const ALLOWED_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL',
  'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'ILIKE', 'BETWEEN', 'IS', 'NULL',
  'ORDER', 'BY', 'ASC', 'DESC', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET',
  'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'CASE', 'WHEN',
  'THEN', 'ELSE', 'END', 'CAST', 'COALESCE', 'UPPER', 'LOWER', 'TRIM',
  'EXTRACT', 'DATE_PART', 'TO_CHAR', 'NOW', 'CURRENT_DATE', 'CURRENT_TIMESTAMP',
  'WITH'
];

const FORBIDDEN_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE',
  'EXEC', 'EXECUTE', 'GRANT', 'REVOKE', 'COMMIT', 'ROLLBACK', 'CALL', 'COPY'
];

export const validateSQL = (sql, userRole) => {
  if (!sql || typeof sql !== 'string') throw new Error('Invalid SQL');

  const upperSQL = sql.toUpperCase().trim();

  // 1. Forbidden Keywords
  for (const keyword of FORBIDDEN_KEYWORDS) {
    if (upperSQL.includes(keyword)) throw new Error(`Forbidden keyword: ${keyword}`);
  }

  // 2. Must be SELECT or WITH
  if (!upperSQL.startsWith('SELECT') && !upperSQL.startsWith('WITH')) {
    throw new Error('Only SELECT queries are allowed');
  }

  // 3. Dangerous Patterns
  if (/;\s*(DROP|DELETE|UPDATE|INSERT)/i.test(sql)) {
    throw new Error('Dangerous SQL pattern detected');
  }

  // 4. ROLE-BASED VALIDATION (Strict for Student/Faculty only)

  if (userRole === 'student') {
    // STRICT: Must filter by student_id
    if (!upperSQL.includes('STUDENT_ID = $') && !upperSQL.includes('STUDENT_ID=$')) {
       throw new Error('Student queries must filter by student_id = $1');
    }
  }

  if (userRole === 'faculty') {
    // STRICT: Must filter by faculty_id
    if (!upperSQL.includes('FACULTY_ID = $') && !upperSQL.includes('FACULTY_ID=$')) {
       // Allow if filtering by department (e.g. for student lists)
       // But generally, faculty should stay within their scope
       if (!upperSQL.includes('$1')) {
           throw new Error('Faculty queries must include a parameter filter ($1)');
       }
    }
  }

  // ADMIN & DEPARTMENT:
  // No checks here. They can query "SELECT * FROM faculty" without ID filters.
  
  return true;
};

export const sanitizeSQL = (sql) => {
  sql = sql.replace(/--.*$/gm, '');
  sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
  sql = sql.trim();
  return sql;
};