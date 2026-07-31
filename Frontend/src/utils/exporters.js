import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

export function exportToExcel(filename, sheets) {
  const wb = XLSX.utils.book_new();
  sheets.forEach((s, i) => {
    const rows = [s.headers || [], ...(s.rows || [])];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    if (s.widths) ws['!cols'] = s.widths.map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, (s.name || `Sheet${i + 1}`).slice(0, 31));
  });
  XLSX.writeFile(wb, filename);
}

export function exportToPDF(filename, title, subtitle, summary, sections) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(201, 168, 76);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 14);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle || '', 14, 21);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 21, { align: 'right' });

  let y = 38;

  if (summary && summary.length) {
    const cols = 2;
    const colW = (pageWidth - 28) / cols;
    const cellH = 14;
    doc.setFontSize(8.5);
    summary.forEach((s, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 14 + col * colW;
      const yy = y + row * cellH;
      doc.setFillColor(240, 235, 225);
      doc.setDrawColor(201, 168, 76);
      doc.roundedRect(x, yy, colW - 4, cellH - 3, 2, 2, 'FD');
      doc.setTextColor(90, 80, 70);
      doc.text(String(s.label || '').toUpperCase(), x + 5, yy + 5.5);
      doc.setTextColor(10, 10, 10);
      doc.setFont('helvetica', 'bold');
      doc.text(String(s.value || ''), x + 5, yy + 11);
      doc.setFont('helvetica', 'normal');
    });
    y += Math.ceil(summary.length / cols) * cellH + 6;
  }

  sections.forEach((sec, idx) => {
    if (!sec.body || !sec.body.length) return;
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(201, 168, 76);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(sec.title || `Section ${idx + 1}`, 14, y);
    doc.setFont('helvetica', 'normal');
    y += 3;
    autoTable(doc, {
      head: [sec.head || []],
      body: sec.body,
      startY: y,
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8, cellPadding: 2.5, textColor: [40, 40, 40] },
      headStyles: { fillColor: [201, 168, 76], textColor: [10, 10, 10], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 242, 236] },
    });
    y = doc.lastAutoTable.finalY + 12;
  });

  doc.save(filename);
}
