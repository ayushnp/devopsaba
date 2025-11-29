import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';

import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { pool } from '../config/db.js';
import { phoneRegex } from '../utils/validators.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/student/profile
router.post(
  '/profile',
  authenticate,
  authorizeRoles('student'),
  body('name').notEmpty(),
  body('phone').optional().matches(phoneRegex).withMessage('Invalid phone number'),
  body('parent_phone').optional().matches(phoneRegex).withMessage('Invalid parent phone number'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const studentId = req.user.id;
    const { name, address, phone, parent_phone } = req.body;
    try {
      const result = await pool.query(
        'UPDATE student SET name=$1, address=$2, phone=$3, parent_phone=$4, updated_at=NOW() WHERE student_id=$5 RETURNING *',
        [name, address || null, phone || null, parent_phone || null, studentId]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Profile update error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/student/marks
router.post(
  '/marks',
  authenticate,
  authorizeRoles('student'),
  body('semester').isInt({ min: 1, max: 12 }),
  body('subjects').isArray({ min: 1 }),
  body('subjects.*.subject_code').notEmpty(),
  body('subjects.*.subject_name').notEmpty(),
  body('subjects.*.internal_marks').isInt({ min: 0, max: 100 }),
  body('subjects.*.external_marks').isInt({ min: 0, max: 100 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const studentId = req.user.id;
    const { semester, subjects, academic_year, exam_type, exam_date } = req.body;

    try {
      // Get student info
      const studentResult = await pool.query('SELECT name, usn FROM student WHERE student_id = $1', [studentId]);
      if (!studentResult.rows.length) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const student = studentResult.rows[0];
      const usn = student.usn;
      const studentName = student.name;

      // Insert each subject as a separate row
      const insertedRows = [];
      for (const subject of subjects) {
        const internalMarks = parseInt(subject.internal_marks, 10);
        const externalMarks = parseInt(subject.external_marks, 10);
        const totalMarks = internalMarks + externalMarks;
        const result = totalMarks >= 40 ? 'P' : 'F';

        const insertResult = await pool.query(
          `INSERT INTO marks_student (
            student_id, usn, student_name, semester, 
            subject_code, subject_name, 
            internal_marks, external_marks, total_marks, result,
            exam_type, exam_date, academic_year, uploaded_by, approval_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'pending')
          RETURNING mark_id`,
          [
            studentId,
            usn,
            studentName,
            semester,
            subject.subject_code,
            subject.subject_name,
            internalMarks,
            externalMarks,
            totalMarks,
            result,
            exam_type || 'Semester Result',
            exam_date || new Date().toISOString().split('T')[0],
            academic_year || null,
            studentId
          ]
        );
        insertedRows.push(insertResult.rows[0].mark_id);
      }

      return res.json({
        success: true,
        message: 'Marks submitted for approval',
        summary: {
          studentName,
          usn,
          semester,
          subjectsInserted: insertedRows.length,
          markIds: insertedRows
        }
      });
    } catch (err) {
      console.error('Marks submission error:', err);
      return res.status(500).json({ message: 'Server error submitting marks', error: err.message });
    }
  }
);

// GET /api/student/leave - FETCH HISTORY
router.get(
  '/leave',
  authenticate,
  authorizeRoles('student'),
  async (req, res) => {
    const studentId = req.user.id;
    try {
      const result = await pool.query(
        'SELECT * FROM student_leave_requests WHERE student_id = $1 ORDER BY timestamp DESC',
        [studentId]
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Leave fetch error:', err);
      return res.status(500).json({ message: 'Server error fetching leaves', error: err.message });
    }
  }
);

// POST /api/student/leave - SUBMIT REQUEST
router.post(
  '/leave',
  authenticate,
  authorizeRoles('student'),
  body('leave_details').notEmpty(),
  body('from_date').notEmpty(),
  body('to_date').notEmpty(),
  body('from_date').custom((value) => {
    const date = new Date(value);
    if (date.getDay() === 0) {
      throw new Error('Cannot apply for leave on Sunday');
    }
    return true;
  }),
  body('to_date').custom((value) => {
    const date = new Date(value);
    if (date.getDay() === 0) {
      throw new Error('Cannot apply for leave on Sunday');
    }
    return true;
  }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const studentId = req.user.id;
    const { leave_details, from_date, to_date } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO student_leave_requests (student_id, leave_details, from_date, to_date) VALUES ($1,$2,$3,$4) RETURNING *',
        [studentId, leave_details, from_date || null, to_date || null]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Leave submission error:', err);
      return res.status(500).json({ message: 'Server error submitting leave', error: err.message });
    }
  }
);

// GET /api/student/courses - Get course materials
router.get(
  '/courses',
  authenticate,
  authorizeRoles('student'),
  async (req, res) => {
    try {
      const student = await pool.query('SELECT department_id FROM student WHERE student_id=$1', [req.user.id]);
      const departmentId = student.rows[0]?.department_id;
      
      if (!departmentId) {
        return res.json([]);
      }
      
      const result = await pool.query(
        `SELECT fc.*, f.faculty_name
         FROM faculty_courses fc
         JOIN faculty f ON fc.faculty_id = f.faculty_id
         WHERE f.department_id = $1
         ORDER BY fc.created_at DESC`,
        [departmentId]
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Courses fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/student/attendance - Get student attendance
router.get(
  '/attendance',
  authenticate,
  authorizeRoles('student'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT sa.*, fc.course_name, f.faculty_name
         FROM student_attendance sa
         LEFT JOIN faculty_courses fc ON sa.course_id = fc.course_id
         LEFT JOIN faculty f ON sa.faculty_id = f.faculty_id
         WHERE sa.student_id = $1
         ORDER BY sa.date DESC`,
        [req.user.id]
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Attendance fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/student/certificates
router.post(
  '/certificates',
  authenticate,
  authorizeRoles('student'),
  upload.single('certificate'),
  async (req, res) => {
    const studentId = req.user.id;
    const { certificate_type, competition, internship, workshop } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO student_certificates (student_id, certificate_type, competition, internship, workshop, file_path, approval_status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
        [
          studentId,
          certificate_type || 'General',
          competition || null,
          internship || null,
          workshop || null,
          req.file?.path || null,
          'pending'
        ]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Certificate upload error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/student/projects
router.post(
  '/projects',
  authenticate,
  authorizeRoles('student'),
  body('project_name').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const studentId = req.user.id;
    const { project_name, domain, impact, guide_id, start_date, end_date } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO student_projects (student_id, project_name, domain, impact, guide_id, start_date, end_date) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
        [
          studentId,
          project_name,
          domain || null,
          impact || null,
          guide_id || null,
          start_date || null,
          end_date || null
        ]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Project submission error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/student/internships
router.post(
  '/internships',
  authenticate,
  authorizeRoles('student'),
  body('company').notEmpty().withMessage('Company name is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const studentId = req.user.id;
    let { stack_data, company, start_date, end_date, stipend } = req.body;
    
    // Handle stack_data - convert array to JSONB if needed
    let stackDataJson = {};
    if (stack_data) {
      if (Array.isArray(stack_data)) {
        stackDataJson = { technologies: stack_data };
      } else if (typeof stack_data === 'string') {
        // If it's a comma-separated string, convert to array
        const stackArray = stack_data.split(',').map(s => s.trim()).filter(Boolean);
        stackDataJson = { technologies: stackArray };
      } else if (typeof stack_data === 'object') {
        stackDataJson = stack_data;
      }
    }
    
    try {
      const result = await pool.query(
        'INSERT INTO student_internships (student_id, stack_data, company, start_date, end_date, stipend, approval_status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
        [
          studentId,
          JSON.stringify(stackDataJson),
          company,
          start_date || null,
          end_date || null,
          stipend ? parseFloat(stipend) : null,
          'pending'
        ]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Internship submission error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/student/internships - Get student internships
router.get(
  '/internships',
  authenticate,
  authorizeRoles('student'),
  async (req, res) => {
    const studentId = req.user.id;
    try {
      const result = await pool.query(
        'SELECT * FROM student_internships WHERE student_id = $1 ORDER BY created_at DESC',
        [studentId]
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Internships fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/student/projects - Get student projects
router.get(
  '/projects',
  authenticate,
  authorizeRoles('student'),
  async (req, res) => {
    const studentId = req.user.id;
    try {
      const result = await pool.query(
        'SELECT * FROM student_projects WHERE student_id = $1 ORDER BY created_at DESC',
        [studentId]
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Projects fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/student/certificates - Get student certificates
router.get(
  '/certificates',
  authenticate,
  authorizeRoles('student'),
  async (req, res) => {
    const studentId = req.user.id;
    try {
      const result = await pool.query(
        'SELECT * FROM student_certificates WHERE student_id = $1 ORDER BY created_at DESC',
        [studentId]
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Certificates fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/student/feedback
router.get(
  '/feedback',
  authenticate,
  authorizeRoles('student'),
  async (req, res) => {
    const studentId = req.user.id;
    try {
      const result = await pool.query('SELECT * FROM student_feedback WHERE student_id=$1 ORDER BY created_at DESC', [studentId]);
      return res.json(result.rows);
    } catch (err) {
      console.error('Feedback fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/student/feedback
router.post(
  '/feedback',
  authenticate,
  authorizeRoles('student'),
  body('feedback').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const studentId = req.user.id;
    const { feedback, rating } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO student_feedback (student_id, feedback, rating) VALUES ($1,$2,$3) RETURNING *',
        [studentId, feedback, rating || null]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Feedback submission error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

export default router;
