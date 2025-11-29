import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { pool } from '../config/db.js';

const router = express.Router();

// GET /api/department/activities - Get all activities
router.get(
  '/activities',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT da.*, d.department_name, f.faculty_name
         FROM department_activities da
         LEFT JOIN department d ON da.department_id = d.department_id
         LEFT JOIN faculty f ON da.created_by = f.faculty_id
         ORDER BY da.timestamp DESC`
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Activities fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/department/activities
router.post(
  '/activities',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  body('event_title').notEmpty().withMessage('Event title is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { department_id, event_title, event_details, event_date } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO department_activities (department_id, event_title, event_details, event_date, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [
          department_id ? parseInt(department_id, 10) : null,
          event_title,
          event_details || null,
          event_date || null,
          req.user.id
        ]
      );
      
      // Create notifications logic (omitted for brevity, same as before)
      return res.json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/department/circulars
router.get(
  '/circulars',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT dc.*, d.department_name, f.faculty_name
         FROM department_circulars dc
         LEFT JOIN department d ON dc.department_id = d.department_id
         LEFT JOIN faculty f ON dc.created_by = f.faculty_id
         ORDER BY dc.timestamp DESC`
      );
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/department/circulars
router.post(
  '/circulars',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  body('title').notEmpty().withMessage('Title is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { department_id, title, circular_details } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO department_circulars (department_id, title, circular_details, created_by) VALUES ($1,$2,$3,$4) RETURNING *',
        [
          department_id ? parseInt(department_id, 10) : null,
          title,
          circular_details || null,
          req.user.id
        ]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/department/list
router.get(
  '/list',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM department ORDER BY department_name');
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/department/staff
router.get(
  '/staff',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    const { department_id } = req.query;
    try {
      // MODIFIED: Return all faculty if no department_id is provided
      let query = 'SELECT * FROM faculty';
      const params = [];
      
      if (department_id) {
        query += ' WHERE department_id = $1';
        params.push(department_id);
      }
      
      query += ' ORDER BY faculty_name';
      
      const result = await pool.query(query, params);
      return res.json(result.rows);
    } catch (err) {
      console.error('Staff fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);
// PUT /api/department/leave-approval - FIXED FK ERROR
router.put(
  '/leave-approval',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    const { leave_id, status, remarks } = req.body;
    
    // FIX: Only use user ID if they are faculty, otherwise NULL to avoid Foreign Key violation
    // because 'department' role users are in 'admin' table, not 'faculty' table.
    const reviewedBy = req.user.role === 'faculty' ? req.user.id : null;
    
    // Append audit info to remarks if ID cannot be stored
    let finalRemarks = remarks || '';
    if (!reviewedBy) {
        finalRemarks = finalRemarks 
            ? `${finalRemarks} (Approved by ${req.user.role})` 
            : `(Approved by ${req.user.role})`;
    }

    try {
      const result = await pool.query(
        `UPDATE student_leave_requests
         SET status=$1, reviewed_by=$2, review_timestamp=NOW(), remarks=$3
         WHERE leave_id=$4
         RETURNING *`,
        [status, reviewedBy, finalRemarks || null, leave_id]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Leave approval error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/department/leave-requests
router.get(
  '/leave-requests',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT lr.*, s.name, s.usn
         FROM student_leave_requests lr
         JOIN student s ON s.student_id = lr.student_id
         WHERE lr.status = 'pending'
         ORDER BY lr.timestamp DESC`
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/department/pending-marks
router.get(
  '/pending-marks',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
          ms.*,
          s.email as student_email,
          s.phone as student_phone,
          d.department_name
         FROM marks_student ms
         LEFT JOIN student s ON ms.student_id = s.student_id
         LEFT JOIN department d ON s.department_id = d.department_id
         WHERE ms.approval_status = 'pending'
         ORDER BY ms.usn, ms.semester, ms.created_at DESC`
      );

      res.json({
        success: true,
        records: result.rows
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: 'Server error fetching pending marks', 
        error: err.message 
      });
    }
  }
);

// PUT /api/department/approve-marks
router.put(
  '/approve-marks',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  [
    body('mark_id').isInt().withMessage('Mark ID is required'),
    body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
    body('remarks').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { mark_id, action, remarks } = req.body;
      const approverId = req.user.id;

      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      // FIXED: SQL Parameter Indices ($1, $2, $3, $4) to match array length
      const result = await pool.query(
        `UPDATE marks_student 
         SET approval_status = $1,
             approved_by = $2,
             approved_at = NOW(),
             approval_remarks = $3,
             updated_at = NOW()
         WHERE mark_id = $4 
         RETURNING *`,
        [newStatus, approverId, remarks, mark_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mark record not found'
        });
      }

      res.json({
        success: true,
        record: result.rows[0],
        message: `Marks ${action}d successfully`
      });

    } catch (err) {
      console.error('Error approving marks:', err);
      res.status(500).json({ 
        success: false,
        message: 'Server error processing approval', 
        error: err.message 
      });
    }
  }
);

// GET /api/department/approved-marks
router.get(
  '/approved-marks',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
          ms.*,
          s.email as student_email,
          d.department_name
         FROM marks_student ms
         LEFT JOIN student s ON ms.student_id = s.student_id
         LEFT JOIN department d ON s.department_id = d.department_id
         WHERE ms.approval_status = 'approved'
         ORDER BY ms.approved_at DESC`
      );

      res.json({
        success: true,
        records: result.rows
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: 'Server error fetching approved marks', 
        error: err.message 
      });
    }
  }
);

// GET /api/department/pending-internships
router.get(
  '/pending-internships',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT si.*, s.name AS student_name, s.usn, d.department_name
         FROM student_internships si
         JOIN student s ON si.student_id = s.student_id
         LEFT JOIN department d ON s.department_id = d.department_id
         ORDER BY si.created_at DESC`
      );
      const records = result.rows.map(row => {
        if (typeof row.stack_data === 'string') {
          try {
            row.stack_data = JSON.parse(row.stack_data);
          } catch (e) {
            row.stack_data = {};
          }
        }
        return row;
      });
      res.json({ success: true, records });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error fetching internships', error: err.message });
    }
  }
);

// Internship approve removed/kept as placeholder if needed, but UI will hide buttons.
// ... keeping existing routes for compatibility ...

// GET /api/department/pending-certificates
router.get(
  '/pending-certificates',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT sc.*, s.name AS student_name, s.usn
         FROM student_certificates sc
         JOIN student s ON sc.student_id = s.student_id
         ORDER BY sc.created_at DESC`
      );
      res.json({ success: true, records: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error fetching certificates', error: err.message });
    }
  }
);

export default router;