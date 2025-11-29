import ExcelJS from 'exceljs';

export const generateExcel = async (data, query, userRole) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Query Results');

    if (!data || data.length === 0) {
      worksheet.addRow(['No data available']);
      worksheet.getColumn(1).width = 30;
    } else {
      // Get headers from first row keys
      const headers = Object.keys(data[0]);
      
      // Add headers with styling
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Add data rows
      data.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header];
          // Handle null/undefined
          if (value === null || value === undefined) return '';
          // Handle dates
          if (value instanceof Date) return value.toLocaleString();
          // Handle objects/arrays
          if (typeof value === 'object') return JSON.stringify(value);
          return value;
        });
        worksheet.addRow(values);
      });

      // Auto-fit columns
      headers.forEach((header, index) => {
        worksheet.getColumn(index + 1).width = Math.max(header.length, 15);
      });

      // Freeze header row
      worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const sanitizedQuery = query.substring(0, 30).replace(/[^a-z0-9]/gi, '_');
    const filename = `query_${sanitizedQuery}_${timestamp}.xlsx`;

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    return { buffer, filename };
  } catch (error) {
    console.error('Excel generation error:', error);
    throw new Error('Failed to generate Excel file: ' + error.message);
  }
};

