// Minimal CSV export helper — takes an array of rows (each row an array of cell values).
function csvEscape(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function rowsToCSV(rows) {
  return rows.map((row) => row.map(csvEscape).join(',')).join('\r\n');
}

export function downloadCSV(filename, rows) {
  const csvContent = rowsToCSV(rows);
  // Prepend a UTF-8 BOM so Excel renders ₹ and other non-ASCII characters correctly.
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
