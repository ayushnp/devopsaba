import express from 'express';

import { authenticate } from '../middleware/auth.js';
import { pool } from '../config/db.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const { id, role } = req.user;
  try {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE (user_id = $1 AND user_type = $2) OR user_type = 'all'
       ORDER BY created_at DESC
       LIMIT 50`,
      [id, role]
    );
    res.json({ notifications: result.rows });
  } catch (err) {
    console.error('Notifications fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  const { id } = req.params;
  const { id: userId, role: userRole } = req.user;
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE notification_id = $1 AND user_id = $2 AND user_type = $3
       RETURNING *`,
      [id, userId, userRole]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Notification update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { user_id, user_type, title, message } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, user_type, title, message)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [user_id, user_type, title, message]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Notification create error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;


