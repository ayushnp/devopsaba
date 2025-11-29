import html2pdf from 'html2pdf.js';

export const exportToPDF = (elementId, filename = 'export.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Content not found for PDF export');
    return;
  }

  const opt = {
    margin: [10, 10, 10, 10],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
};

