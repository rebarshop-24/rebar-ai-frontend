import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generateEstimateReport(data) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ESTIMATE REPORT", 105, 20, { align: "center" });
  
  // Project Info
  doc.setFontSize(12);
  doc.text("Project Name:", 20, 40);
  doc.setFont("helvetica", "normal");
  doc.text(data.projectName || "", 80, 40);
  
  doc.setFont("helvetica", "bold");
  doc.text("Date:", 20, 50);
  doc.setFont("helvetica", "normal");
  doc.text(new Date().toLocaleDateString(), 80, 50);

  // Line Items Table
  doc.autoTable({
    startY: 70,
    head: [['Item', 'Description', 'Quantity', 'Unit Price', 'Total']],
    body: data.lineItems.map(item => [
      item.name,
      item.description,
      item.quantity,
      `$${item.unitPrice.toFixed(2)}`,
      `$${(item.quantity * item.unitPrice).toFixed(2)}`
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] }
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("Subtotal:", 140, finalY);
  doc.text("Tax (10%):", 140, finalY + 10);
  doc.text("Total:", 140, finalY + 20);

  doc.setFont("helvetica", "normal");
  const subtotal = data.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  doc.text(`$${subtotal.toFixed(2)}`, 170, finalY, { align: "right" });
  doc.text(`$${tax.toFixed(2)}`, 170, finalY + 10, { align: "right" });
  doc.text(`$${total.toFixed(2)}`, 170, finalY + 20, { align: "right" });

  // Notes
  doc.setFont("helvetica", "bold");
  doc.text("Notes:", 20, finalY + 40);
  doc.setFont("helvetica", "normal");
  doc.text(data.notes || "No additional notes", 20, finalY + 50);

  return doc;
}