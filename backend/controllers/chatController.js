import { generateExcel } from '../services/excelService.js';
import { validateSQL } from '../services/sqlValidator.js';
// import { pool } from '../config/database.js'; // Assuming you have a DB connection

export const downloadExcel = async (req, res) => {
  try {
    const { sql, userQuery, userRole, userId } = req.body;

    // 1. SECURITY: Re-validate the SQL to prevent tampering
    // (User could modify the SQL on the frontend before sending it back)
    validateSQL(sql, userRole, userId);

    // 2. FETCH DATA: Execute the SQL to get the rows
    // const result = await pool.query(sql); 
    // const data = result.rows; 
    
    // --- MOCK DATA (Replace this with your actual DB call above) ---
    const data = [
      { id: 1, name: "Project Alpha", domain: "AI", student_id: 101 },
      { id: 2, name: "Project Beta", domain: "Web", student_id: 102 }
    ];
    // -------------------------------------------------------------

    // 3. GENERATE EXCEL: Use your existing service
    const { buffer, filename } = await generateExcel(data, userQuery || 'Export', userRole);

    // 4. SEND RESPONSE: Set headers so browser treats it as a file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send the binary buffer
    res.send(buffer);

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
};