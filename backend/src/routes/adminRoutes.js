import express from 'express';
import bcrypt from 'bcryptjs';
import { body, param, validationResult } from 'express-validator';

import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { pool } from '../config/db.js';

const router = express.Router();

// POST /api/admin/master-data - hostel routes, transport, fee structure
router.post(
  '/master-data',
  authenticate,
  authorizeRoles('admin'),
  async (req, res) => {
    const { type } = req.body; // 'hostel_route' | 'fee_structure'
    try {
      let result;
      if (type === 'hostel_route') {
        const { transport_details, route_name, active } = req.body;
        result = await pool.query(
          'INSERT INTO hostel_routes (transport_details, route_name, active) VALUES ($1,$2,$3) RETURNING *',
          [transport_details || {}, route_name, active ?? true]
        );
      } else if (type === 'fee_structure') {
        const { structure_details, department_id, academic_year } = req.body;
        result = await pool.query(
          'INSERT INTO fee_structure (structure_details, department_id, academic_year) VALUES ($1,$2,$3) RETURNING *',
          [structure_details || {}, department_id || null, academic_year || null]
        );
      } else {
        return res.status(400).json({ message: 'Invalid master-data type' });
      }
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Master data error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/admin/logs - login logs with dates
router.get(
  '/logs',
  authenticate,
  authorizeRoles('admin'),
  async (req, res) => {
    const { from, to } = req.query;
    try {
      const result = await pool.query(
        `SELECT * FROM login_logs
         WHERE ($1::date IS NULL OR login_date >= $1::date)
           AND ($2::date IS NULL OR login_date <= $2::date)
         ORDER BY login_timestamp DESC`,
        [from || null, to || null]
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Login logs fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/admin/fee-structure - Get fee structures
router.get(
  '/fee-structure',
  authenticate,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM fee_structure ORDER BY academic_year DESC, created_at DESC'
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Fee structure fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/admin/fee-structure - Create fee structure
router.post(
  '/fee-structure',
  authenticate,
  authorizeRoles('admin'),
  body('academic_year').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { structure_details, department_id, academic_year } = req.body;
    try {
      // Handle structure_details - convert to JSONB if it's a string
      let structureDetailsJson = {};
      if (structure_details) {
        if (typeof structure_details === 'string') {
          try {
            structureDetailsJson = JSON.parse(structure_details);
          } catch (e) {
            structureDetailsJson = { description: structure_details };
          }
        } else if (typeof structure_details === 'object') {
          structureDetailsJson = structure_details;
        }
      }
      
      const result = await pool.query(
        'INSERT INTO fee_structure (structure_details, department_id, academic_year) VALUES ($1,$2,$3) RETURNING *',
        [
          JSON.stringify(structureDetailsJson),
          department_id ? parseInt(department_id, 10) : null,
          academic_year
        ]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Fee structure error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/admin/reports - simple aggregated reports
router.get(
  '/reports',
  authenticate,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const [students, faculty, departments, leaves] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM student'),
        pool.query('SELECT COUNT(*) FROM faculty'),
        pool.query('SELECT COUNT(*) FROM department'),
        pool.query(`SELECT status, COUNT(*) FROM student_leave_requests GROUP BY status`)
      ]);
      return res.json({
        students: Number(students.rows[0].count),
        faculty: Number(faculty.rows[0].count),
        departments: Number(departments.rows[0].count),
        leaveSummary: leaves.rows
      });
    } catch (err) {
      console.error('Reports error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/users/profile - shared endpoint for current user profile
router.get(
  '/users/profile',
  authenticate,
  async (req, res) => {
    const { id, role } = req.user;
    try {
      let result;
      if (role === 'admin' || role === 'department') {
        result = await pool.query('SELECT * FROM admin WHERE admin_id=$1', [id]);
      } else if (role === 'faculty') {
        result = await pool.query('SELECT * FROM faculty WHERE faculty_id=$1', [id]);
      } else if (role === 'student') {
        result = await pool.query('SELECT * FROM student WHERE student_id=$1', [id]);
      }
      return res.json({ role, profile: result?.rows[0] || null });
    } catch (err) {
      console.error('Profile fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

router.post(
  '/users',
  authenticate,
  authorizeRoles('admin'),
  async (req, res) => {
    const { username, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    try {
      let result;
      if (role === 'admin' || role === 'department') {
        result = await pool.query(
          `INSERT INTO admin (username, password_hash, role)
           VALUES ($1,$2,$3)
           ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
           RETURNING admin_id AS id, username, role`,
          [username, passwordHash, role]
        );
      } else if (role === 'faculty') {
        result = await pool.query(
          `INSERT INTO faculty (faculty_name, email, password_hash)
           VALUES ($1,$1,$2)
           ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
           RETURNING faculty_id AS id, email AS username, 'faculty' AS role`,
          [username, passwordHash]
        );
      } else if (role === 'student') {
        result = await pool.query(
          `INSERT INTO student (usn, name, email, password_hash)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
           RETURNING student_id AS id, email AS username, 'student' AS role`,
          [username.toUpperCase(), `Student ${username}`, username, passwordHash]
        );
      } else {
        return res.status(400).json({ message: 'Unsupported role' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('User creation error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

const featureValidators = [
  body('feature_name').notEmpty(),
  body('feature_type').notEmpty(),
  body('target_audience').notEmpty(),
  body('academic_year').notEmpty()
];

router.post(
  '/features',
  authenticate,
  authorizeRoles('admin'),
  featureValidators,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { feature_name, feature_type, description, target_audience, academic_year } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO admin_features (feature_name, feature_type, description, target_audience, academic_year, created_by)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [feature_name, feature_type, description, target_audience, academic_year, req.user.id]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Feature creation error:', err);
      res.status(500).json({ message: 'Server error creating feature', error: err.message });
    }
  }
);

router.get(
  '/features',
  authenticate,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM admin_features ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (err) {
      console.error('Features fetch error:', err);
      res.status(500).json({ message: 'Server error fetching features', error: err.message });
    }
  }
);

router.put(
  '/features/:id',
  authenticate,
  authorizeRoles('admin'),
  [
    param('id').isInt(),
    body('feature_name').optional().notEmpty(),
    body('feature_type').optional().notEmpty(),
    body('target_audience').optional().notEmpty(),
    body('academic_year').optional().notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { feature_name, feature_type, description, target_audience, academic_year } = req.body;
    try {
      const result = await pool.query(
        `UPDATE admin_features
         SET feature_name = COALESCE($2, feature_name),
             feature_type = COALESCE($3, feature_type),
             description = COALESCE($4, description),
             target_audience = COALESCE($5, target_audience),
             academic_year = COALESCE($6, academic_year),
             updated_at = NOW()
         WHERE feature_id = $1
         RETURNING *`,
        [id, feature_name, feature_type, description, target_audience, academic_year]
      );
      if (!result.rows.length) {
        return res.status(404).json({ message: 'Feature not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Feature update error:', err);
      res.status(500).json({ message: 'Server error updating feature', error: err.message });
    }
  }
);

router.delete(
  '/features/:id',
  authenticate,
  authorizeRoles('admin'),
  param('id').isInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const result = await pool.query('DELETE FROM admin_features WHERE feature_id = $1 RETURNING feature_id', [
        req.params.id
      ]);
      if (!result.rows.length) {
        return res.status(404).json({ message: 'Feature not found' });
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Feature delete error:', err);
      res.status(500).json({ message: 'Server error deleting feature', error: err.message });
    }
  }
);

export default router;


