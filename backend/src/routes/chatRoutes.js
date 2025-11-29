import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { pool } from '../config/db.js';
import { generateSQL, formatResponse } from '../services/geminiService.js';
import { generateExcel } from '../services/excelService.js';
import { validateSQL, sanitizeSQL } from '../services/sqlValidator.js';

const router = express.Router();

const getQueryParams = (sql, userRole, userId) => {
  const paramMatches = sql.match(/\$\d+/g) || [];
  const paramCount = paramMatches.length > 0 
    ? Math.max(...paramMatches.map(p => parseInt(p.replace('$', ''))))
    : 0;

  if (paramCount === 0) return [];

  // STRICT RESTRICTION: Students and Faculty MUST use parameters for their ID
  if (['student', 'faculty'].includes(userRole)) {
    return Array(paramCount).fill(userId);
  }

  // RELAXED: Admin and Department usually don't need params.
  // But if the AI hallucinated a '$1' in the SQL, we fill it to prevent a crash.
  return Array(paramCount).fill(userId);
};

router.post(
  '/query',
  authenticate,
  authorizeRoles('student', 'faculty', 'admin', 'department'),
  body('query').notEmpty().withMessage('Query is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { query } = req.body;
    const { id: userId, role: userRole } = req.user;

    try {
      let sql = await generateSQL(query, userRole, userId);

      if (sql === 'NON_SQL_INTENT') {
        return res.json({
          success: true,
          query,
          sql: null,
          response: "Hello! Ask me about students, faculty, marks, or circulars.",
          data: [],
          count: 0
        });
      }

      sql = sanitizeSQL(sql);
      
      // Pass role to validator to enforce strictness only for Student/Faculty
      validateSQL(sql, userRole);

      const queryParams = getQueryParams(sql, userRole, userId);

      const result = await pool.query(sql, queryParams);
      const rows = result.rows || [];
      const botResponse = await formatResponse(query, sql, rows);

      // Save History (Non-blocking)
      pool.query(
        `INSERT INTO chat_history (user_id, user_type, user_query, generated_sql, bot_response, result_data)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, userRole, query, sql, botResponse, JSON.stringify(rows)]
      ).catch(err => console.error("History Error:", err.message));

      res.json({
        success: true,
        query,
        sql,
        response: botResponse,
        data: rows,
        count: rows.length
      });

    } catch (error) {
      console.error('Chat Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Download Route (Simplified for brevity, logic matches above)
router.post('/download', authenticate, async (req, res) => {
    const { query, sql } = req.body;
    const { id: userId, role: userRole } = req.user;
    try {
      validateSQL(sql, userRole); // Validate again
      const queryParams = getQueryParams(sql, userRole, userId);
      const result = await pool.query(sql, queryParams);
      const { buffer, filename } = await generateExcel(result.rows || [], query, userRole);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Download failed' });
    }
});

export default router;