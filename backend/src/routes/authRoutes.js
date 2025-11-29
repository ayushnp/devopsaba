import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

import { pool } from '../config/db.js';
import {
  loginAttemptsMiddleware,
  recordFailedAttempt,
  resetLoginAttempts
} from '../middleware/loginAttempts.js';
import { isStrongPassword } from '../utils/validators.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// POST /api/auth/register
router.post(
  '/register',
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((value) => (isStrongPassword(value) ? true : Promise.reject(new Error('Password is not strong enough')))),
  body('role').optional().isIn(['student', 'faculty', 'department', 'admin']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, usn, role } = req.body;
    const userRole = role || 'student'; 

    try {
      if (!isStrongPassword(password)) {
        return res.status(400).json({
          message: 'Password must be 8+ chars and include uppercase, lowercase, number and special character'
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      let result;

      if (userRole === 'student') {
        if (!usn) return res.status(400).json({ message: 'USN is required for students' });
        
        const userCheck = await pool.query('SELECT * FROM student WHERE email = $1 OR usn = $2', [email, usn]);
        if (userCheck.rows.length > 0) return res.status(400).json({ message: 'Student already exists' });

        result = await pool.query(
          'INSERT INTO student (name, email, password_hash, usn) VALUES ($1, $2, $3, $4) RETURNING student_id as id, name, email, $5::text as role',
          [name, email, passwordHash, usn.toUpperCase(), 'student']
        );

      } else if (userRole === 'faculty') {
        const userCheck = await pool.query('SELECT * FROM faculty WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) return res.status(400).json({ message: 'Faculty already exists' });

        result = await pool.query(
          'INSERT INTO faculty (faculty_name, email, password_hash) VALUES ($1, $2, $3) RETURNING faculty_id as id, faculty_name as name, email, $4::text as role',
          [name, email, passwordHash, 'faculty']
        );

      } else if (userRole === 'admin' || userRole === 'department') {
        const username = email; 
        const userCheck = await pool.query('SELECT * FROM admin WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) return res.status(400).json({ message: 'Admin/Dept user already exists' });

        // FIXED: Changed "RETURNINGQV" to "RETURNING"
        result = await pool.query(
          'INSERT INTO admin (username, password_hash, role) VALUES ($1, $2, $3) RETURNING admin_id as id, username as name, role',
          [username, passwordHash, userRole]
        );

      } else {
        return res.status(400).json({ message: 'Invalid role selected' });
      }
      
      res.status(201).json({ message: 'Registration successful', user: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

router.post(
  '/login',
  loginAttemptsMiddleware,
  body('username').notEmpty(),
  body('password').notEmpty(),
  body('role').isIn(['student', 'faculty', 'department', 'admin']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, role } = req.body;

    try {
      let user;
      let userType;

      if (role === 'admin') {
        const result = await pool.query('SELECT * FROM admin WHERE username = $1', [username]);
        user = result.rows[0];
        userType = 'admin';
      } else if (role === 'department') {
        const result = await pool.query('SELECT * FROM admin WHERE username = $1 AND role = $2', [username, 'department']);
        user = result.rows[0];
        userType = 'department';
      } else if (role === 'faculty') {
        const result = await pool.query('SELECT * FROM faculty WHERE email = $1', [username]);
        user = result.rows[0];
        userType = 'faculty';
      } else if (role === 'student') {
        const result = await pool.query('SELECT * FROM student WHERE email = $1 OR usn = $1', [username]);
        user = result.rows[0];
        userType = 'student';
      } else {
        return res.status(400).json({ message: 'Invalid role' });
      }

      if (!user) {
        recordFailedAttempt(req.loginAttemptKey);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash || '');
      if (!isMatch) {
        recordFailedAttempt(req.loginAttemptKey);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // FIXED: Changed "constHZ" to "const"
      const payload = {
        id: user.admin_id || user.faculty_id || user.student_id,
        role: userType
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' }); // Typo "constQl" fixed below implicitly by just writing 'const'

      await pool.query(
        'INSERT INTO login_logs (user_id, user_type, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
        [payload.id, userType, req.ip, req.headers['user-agent'] || null]
      );

      resetLoginAttempts(req.loginAttemptKey);

      return res.json({ token, user: payload });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

router.post(
  '/validate-password',
  body('password').notEmpty(),
  (req, res) => {
    const { password } = req.body;
    const valid = isStrongPassword(password);
    return res.json({
      valid,
      message: valid
        ? 'Password meets requirements'
        : 'Password must include uppercase, lowercase, number and special character'
    });
  }
);

export default router;