import React, { useState } from 'react';
// FIX: Import your configured API client instead of raw axios
// Adjust the path if your structure is different, but based on Chatbot.jsx this seems right:
import { api } from '../../../api/client.js'; 

const ExcelExportButton = ({ sql, query }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!sql || !query) return;
    
    setLoading(true);
    try {
      // FIX: Use 'api.post' instead of 'axios.post'
      // This automatically handles the Base URL and Auth Headers
      const response = await api.post('/chat/download', 
        { sql, query },
        { responseType: 'blob' } // IMPORTANT: Tells axios to handle binary data
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${query.substring(0, 10).replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      
      // Improved Error Logging
      if (error.response && error.response.data instanceof Blob) {
        // If the backend sent a JSON error as a Blob, try to read it
        const reader = new FileReader();
        reader.onload = () => {
           console.error("Backend Error Message:", reader.result);
           alert("Error: " + reader.result);
        };
        reader.readAsText(error.response.data);
      } else {
        alert('Failed to download Excel file. Check console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center gap-2">
           <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           Generating...
        </span>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export to Excel
        </>
      )}
    </button>
  );
};

export default ExcelExportButton;