import React from 'react';
import ExcelExportButton from './ExcelExportButton.jsx'; // Make sure path is correct

const ChatMessage = ({ message }) => {
  const isUser = message.type === 'user';
  const isError = message.isError;

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
        isUser ? 'bg-blue-600' : isError ? 'bg-red-100' : 'bg-blue-100'
      }`}>
        {isUser ? (
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className={`h-5 w-5 ${isError ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block max-w-[80%] rounded-lg px-4 py-3 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : isError 
            ? 'bg-red-50 text-red-800 border border-red-200' 
            : 'bg-slate-100 text-slate-800'
        }`}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          
          {/* Show data preview if available */}
          {!isUser && !isError && message.data && message.data.length > 0 && (
            <div className="mt-3 rounded border border-slate-200 bg-white p-3 text-left">
              <p className="mb-2 text-xs font-semibold text-slate-600">
                Found {message.data.length} record(s):
              </p>
              <div className="max-h-40 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {Object.keys(message.data[0]).slice(0, 5).map((key) => (
                        <th key={key} className="px-2 py-1 text-left font-semibold text-slate-600">
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {message.data.slice(0, 3).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        {Object.keys(message.data[0]).slice(0, 5).map((key) => (
                          <td key={key} className="px-2 py-1 text-slate-700">
                            {row[key] !== null && row[key] !== undefined 
                              ? String(row[key]).substring(0, 30) 
                              : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {message.data.length > 3 && (
                  <p className="mt-2 text-xs text-slate-500">
                    ... and {message.data.length - 3} more row(s)
                  </p>
                )}
              </div>

              {/* --- NEW: Export Button --- */}
              {/* Only show if we have valid SQL to re-run the query safely */}
              {message.sql && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                  <ExcelExportButton 
                    sql={message.sql} 
                    query={message.query || "Export"} 
                  />
                </div>
              )}
              {/* ------------------------- */}

            </div>
          )}
        </div>
        
        {/* Timestamp */}
        {message.timestamp && (
          <p className={`mt-1 text-xs text-slate-500 ${isUser ? 'text-right' : ''}`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;