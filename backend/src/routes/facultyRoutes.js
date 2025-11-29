import express from 'express';
import multer from 'multer';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { pool } from '../config/db.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// GET /api/faculty/profile - Fetch existing profile
router.get(
  '/profile',
  authenticate,
  authorizeRoles('faculty'),
  async (req, res) => {
    try {
      const facultyId = req.user.id;
      const result = await pool.query(
        'SELECT * FROM faculty_profile WHERE faculty_id = $1',
        [facultyId]
      );
      
      if (result.rows.length === 0) {
        return res.json({}); // Return empty object if no profile exists
      }
      
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Fetch profile error:', err);
      return res.status(500).json({ message: 'Server error fetching profile' });
    }
  }
);

// POST /api/faculty/profile - Update/Create profile
router.post(
  '/profile',
  authenticate,
  authorizeRoles('faculty'),
  async (req, res) => {
    const facultyId = req.user.id;
    let { courses, department_id, time_details, bio } = req.body;
    
    // 1. Handle Courses (Convert string/array to JSONB object)
    let coursesJson = {};
    if (courses) {
      if (Array.isArray(courses)) {
        coursesJson = { course_list: courses };
      } else if (typeof courses === 'string') {
        // Split newline string into array
        const courseArray = courses.split('\n').map(c => c.trim()).filter(Boolean);
        coursesJson = { course_list: courseArray };
      }
    }
    
    // 2. Handle Department ID (Ensure it is an Integer)
    const deptId = department_id ? parseInt(department_id, 10) : null;

    // 3. Handle Time Details (Wrap string in object for JSONB)
    const timeJson = time_details ? { details: time_details } : {};
    
    try {
      // Check if profile exists
      const existing = await pool.query('SELECT faculty_id FROM faculty_profile WHERE faculty_id = $1', [facultyId]);
      
      if (existing.rows.length > 0) {
        // UPDATE existing record
        const result = await pool.query(
          `UPDATE faculty_profile 
           SET courses = $1, department_id = $2, time_details = $3, bio = $4, updated_at = NOW()
           WHERE faculty_id = $5
           RETURNING *`,
          [coursesJson, deptId, timeJson, bio, facultyId]
        );
        return res.json(result.rows[0]);
      } else {
        // INSERT new record
        const result = await pool.query(
          `INSERT INTO faculty_profile (faculty_id, courses, department_id, time_details, bio)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [facultyId, coursesJson, deptId, timeJson, bio]
        );
        return res.json(result.rows[0]);
      }
    } catch (err) {
      console.error('Faculty profile update error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/faculty/courses - upload course materials
router.post(
  '/courses',
  authenticate,
  authorizeRoles('faculty'),
  upload.array('materials'),
  async (req, res) => {
    const facultyId = req.user.id;
    const { course_code, course_name, semester, academic_year } = req.body;
    // Save relative path
    const materials = (req.files || []).map((f) => ({ 
      filename: f.originalname, 
      path: f.path.replace(/\\/g, '/') // Normalize windows paths
    }));
    
    try {
      const result = await pool.query(
        `INSERT INTO faculty_courses (faculty_id, course_name, course_code, materials, semester, academic_year)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          facultyId,
          course_name || 'Unnamed Course',
          course_code || 'NA',
          JSON.stringify(materials),
          semester ? parseInt(semester, 10) : null,
          academic_year || null
        ]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Course upload error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/faculty/attendance
router.get(
  '/attendance',
  authenticate,
  authorizeRoles('faculty'),
  async (req, res) => {
    const { course_id, date } = req.query;
    try {
      let query = `SELECT sa.*, s.name as student_name, s.usn 
                   FROM student_attendance sa
                   JOIN student s ON sa.student_id = s.student_id
                   WHERE sa.faculty_id = $1`;
      const params = [req.user.id];
      
      if (course_id) {
        query += ` AND sa.course_id = $${params.length + 1}`;
        params.push(course_id);
      }
      if (date) {
        query += ` AND sa.date = $${params.length + 1}`;
        params.push(date);
      }
      
      query += ' ORDER BY sa.date DESC, s.name';
      const result = await pool.query(query, params);
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/faculty/attendance
router.post(
  '/attendance',
  authenticate,
  authorizeRoles('faculty'),
  async (req, res) => {
    const { records, course_id, date } = req.body;
    const facultyId = req.user.id;
    const attendanceDate = date || new Date().toISOString().split('T')[0];
    
    try {
      const insertPromises = records
        .filter(record => record.student_id)
        .map((record) => {
          return pool.query(
            `INSERT INTO student_attendance (student_id, faculty_id, course_id, date, status)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (student_id, course_id, date)
             DO UPDATE SET status = EXCLUDED.status, created_at = NOW()
             RETURNING *`,
            [
              parseInt(record.student_id, 10),
              facultyId,
              course_id ? parseInt(course_id, 10) : null,
              attendanceDate,
              record.status || 'present'
            ]
          );
        });
      
      await Promise.all(insertPromises);
      return res.json({ message: 'Attendance recorded successfully', count: records.length });
    } catch (err) {
      console.error('Attendance error:', err);
      return res.status(500).json({ message: 'Server error recording attendance' });
    }
  }
);

// GET /api/faculty/students - Get ALL student details
router.get(
  '/students',
  authenticate,
  authorizeRoles('faculty'),
  async (req, res) => {
    try {
      // UPDATED: Fetch ALL students regardless of department
      const result = await pool.query('SELECT * FROM student ORDER BY usn ASC');
      return res.json(result.rows);
    } catch (err) {
      console.error('Students fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/faculty/projects
router.get(
  '/projects',
  authenticate,
  authorizeRoles('faculty'),
  async (req, res) => {
    try {
      // Projects are also fetched without strict department filtering based on your potential needs, 
      // but if you want ALL projects visible to faculty, you can remove the WHERE clause here too.
      // For now, I am keeping the existing logic for projects unless you specified otherwise.
      // Assuming you might want to see all student projects regardless of dept:
      
      const result = await pool.query(
        `SELECT sp.*, s.name as student_name, s.usn
         FROM student_projects sp
         JOIN student s ON sp.student_id = s.student_id
         ORDER BY sp.created_at DESC`
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Projects fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// PUT /api/faculty/projects/:id
router.put(
  '/projects/:id',
  authenticate,
  authorizeRoles('faculty'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `UPDATE student_projects 
         SET guide_id = $1, updated_at = NOW()
         WHERE project_id = $2
         RETURNING *`,
        [req.user.id, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Project update error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/faculty/courses
router.get(
  '/courses',
  authenticate,
  authorizeRoles('faculty'),
  async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM faculty_courses WHERE faculty_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Courses fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

export default router;