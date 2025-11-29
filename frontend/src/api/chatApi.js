// src/api/chatApi.js
import axios from 'axios'; // Assuming you use axios, otherwise use fetch

const API_URL = 'http://localhost:5000/api';
export const downloadExcel = async (userQuery, sqlQuery) => {
  try {
    const response = await axios.post(
      `${API_URL}/chat/download`,
      { 
        query: userQuery,
        sql: sqlQuery 
      },
      {
        responseType: 'blob', // IMPORTANT: This tells axios to treat the response as a file
        withCredentials: true // If you use cookies/sessions
      }
    );

    // Create a download link programmatically
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Create a filename with current timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `report_${timestamp}.xlsx`);
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Download failed", error);
    throw error;
  }
};