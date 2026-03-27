import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { Factura, Cliente, Empresa, Rubro } from '@/types';
import { getRubroById, rubros } from '@/data/rubros';

// Extend jsPDF type to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => void;
  lastAutoTable?: { finalY: number };
}

// Helper to convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

// Format currency
const formatCurrency = (amount: number, moneda: string = 'EUR'): string => {
  const symbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
  };
  return `${amount.toFixed(2)} ${symbols[moneda] || '€'}`;
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Add stamp based on invoice status
const addStamp = (
  doc: jsPDFWithAutoTable,
  estado: string,
  x: number,
  y: number,
  _colorPrimario: string
): void => {
  const stamps: Record<string, { text: string; color: string }> = {
    pagada: { text: 'PAGADA', color: '#22c55e' },
    enviada: { text: 'ENVIADA', color: '#3b82f6' },
    vencida: { text: 'VENCIDA', color: '#ef4444' },
    anulada: { text: 'ANULADA', color: '#6b7280' },
    borrador: { text: 'BORRADOR', color: '#f59e0b' },
    vista: { text: 'VISTA', color: '#8b5cf6' },
  };

  const stamp = stamps[estado] || stamps.borrador;
  const stampRgb = hexToRgb(stamp.color);

  // Draw stamp circle
  doc.setDrawColor(stampRgb.r, stampRgb.g, stampRgb.b);
  doc.setLineWidth(3);
  doc.ellipse(x, y, 25, 12, 'S');

  // Add stamp text
  doc.setTextColor(stampRgb.r, stampRgb.g, stampRgb.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(stamp.text, x, y + 3, { align: 'center' });

  // Reset
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
};

// Base PDF template
const generateBasePDF = (
  factura: Factura,
  cliente: Cliente | undefined,
  empresa: Empresa,
  rubro: Rubro
): jsPDFWithAutoTable => {
  const doc = new jsPDF('p', 'mm', 'a4') as jsPDFWithAutoTable;
  const rgbPrimario = hexToRgb(empresa.colorPrimario);
  const rgbSecundario = hexToRgb(empresa.colorSecundario);
  const pageWidth = doc.internal.pageSize.width;

  // Header background
  doc.setFillColor(rgbPrimario.r, rgbPrimario.g, rgbPrimario.b);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Company name in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa.nombre, 20, 25);

  // Company info in header
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const companyInfo = [
    empresa.razonSocial || empresa.nombre,
    `NIF/CIF: ${empresa.nifCif}`,
    empresa.direccion || '',
    `${empresa.ciudad || ''} ${empresa.codigoPostal || ''}`,
    empresa.email,
    empresa.telefono || '',
  ].filter(Boolean);
  
  let yPos = 35;
  companyInfo.forEach((line) => {
    doc.text(line, 20, yPos);
    yPos += 4;
  });

  // Invoice title
  doc.setTextColor(rgbPrimario.r, rgbPrimario.g, rgbPrimario.b);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(rubro.terminologia.factura.toUpperCase(), pageWidth - 20, 25, { align: 'right' });

  // Invoice number
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº: ${factura.numero}`, pageWidth - 20, 35, { align: 'right' });

  // Dates
  doc.text(`Fecha emisión: ${formatDate(factura.fechaEmision)}`, pageWidth - 20, 42, { align: 'right' });
  doc.text(`Vencimiento: ${formatDate(factura.fechaVencimiento)}`, pageWidth - 20, 48, { align: 'right' });

  // Client section
  doc.setFillColor(rgbSecundario.r, rgbSecundario.g, rgbSecundario.b);
  doc.rect(20, 60, 80, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(rubro.terminologia.cliente.toUpperCase(), 24, 65.5);

  // Client info
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (cliente) {
    doc.setFont('helvetica', 'bold');
    doc.text(cliente.nombre, 20, 78);
    doc.setFont('helvetica', 'normal');
    
    const clientInfo = [
      cliente.nifCif ? `NIF/CIF: ${cliente.nifCif}` : '',
      cliente.direccion || '',
      `${cliente.ciudad || ''} ${cliente.codigoPostal || ''}`,
      cliente.email || '',
      cliente.telefono || '',
    ].filter(Boolean);
    
    yPos = 84;
    clientInfo.forEach((line) => {
      doc.text(line, 20, yPos);
      yPos += 5;
    });
  }

  return doc;
};

// Template: Default
const generateDefaultPDF = (
  factura: Factura,
  cliente: Cliente | undefined,
  empresa: Empresa,
  rubro: Rubro
): jsPDFWithAutoTable => {
  const doc = generateBasePDF(factura, cliente, empresa, rubro);
  const rgbPrimario = hexToRgb(empresa.colorPrimario);
  const pageWidth = doc.internal.pageSize.width;

  // Items table
  const tableData = factura.lineas.map((linea) => [
    linea.descripcion,
    linea.cantidad.toString(),
    formatCurrency(linea.precioUnitario, empresa.moneda),
    linea.descuento > 0 ? `${linea.descuento}%` : '-',
    formatCurrency(linea.total, empresa.moneda),
  ]);

  doc.autoTable({
    startY: 110,
    head: [['Descripción', 'Cant.', 'Precio', 'Dto.', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [rgbPrimario.r, rgbPrimario.g, rgbPrimario.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
    },
  });

  const finalY = doc.lastAutoTable?.finalY || 150;

  // Totals section
  const totalsX = pageWidth - 80;
  let totalsY = finalY + 15;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Subtotal:', totalsX, totalsY);
  doc.text(formatCurrency(factura.subtotal, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  if (factura.totalDescuento > 0) {
    totalsY += 7;
    doc.text('Descuento:', totalsX, totalsY);
    doc.text(`-${formatCurrency(factura.totalDescuento, empresa.moneda)}`, pageWidth - 20, totalsY, { align: 'right' });
  }

  totalsY += 7;
  doc.text('IVA:', totalsX, totalsY);
  doc.text(formatCurrency(factura.totalIva, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  if (factura.totalIrpf > 0) {
    totalsY += 7;
    doc.text('IRPF:', totalsX, totalsY);
    doc.text(`-${formatCurrency(factura.totalIrpf, empresa.moneda)}`, pageWidth - 20, totalsY, { align: 'right' });
  }

  // Total line
  totalsY += 10;
  doc.setDrawColor(rgbPrimario.r, rgbPrimario.g, rgbPrimario.b);
  doc.setLineWidth(0.5);
  doc.line(totalsX, totalsY - 4, pageWidth - 20, totalsY - 4);

  doc.setTextColor(rgbPrimario.r, rgbPrimario.g, rgbPrimario.b);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', totalsX, totalsY);
  doc.text(formatCurrency(factura.total, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  // Notes
  if (factura.notas) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Notas:', 20, totalsY + 15);
    doc.setTextColor(50, 50, 50);
    const splitNotes = doc.splitTextToSize(factura.notas, pageWidth - 40);
    doc.text(splitNotes, 20, totalsY + 22);
  }

  // Stamp
  addStamp(doc, factura.estado, pageWidth / 2, 270, empresa.colorPrimario);

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('Generado con Verifactus - Sistema de Facturación Profesional', pageWidth / 2, 285, { align: 'center' });

  return doc;
};

// Template: Médico
const generateMedicoPDF = (
  factura: Factura,
  cliente: Cliente | undefined,
  empresa: Empresa,
  rubro: Rubro
): jsPDFWithAutoTable => {
  const doc = generateBasePDF(factura, cliente, empresa, rubro);
  const pageWidth = doc.internal.pageSize.width;

  // Medical cross symbol in header
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(3);
  doc.line(pageWidth - 70, 15, pageWidth - 70, 35);
  doc.line(pageWidth - 80, 25, pageWidth - 60, 25);

  // Items table with medical styling
  const tableData = factura.lineas.map((linea) => [
    linea.descripcion,
    linea.cantidad.toString(),
    formatCurrency(linea.precioUnitario, empresa.moneda),
    formatCurrency(linea.total, empresa.moneda),
  ]);

  doc.autoTable({
    startY: 110,
    head: [['Procedimiento', 'Cant.', 'Precio', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [239, 68, 68],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
  });

  const finalY = doc.lastAutoTable?.finalY || 150;

  // Totals
  const totalsX = pageWidth - 80;
  let totalsY = finalY + 15;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Subtotal:', totalsX, totalsY);
  doc.text(formatCurrency(factura.subtotal, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  totalsY += 7;
  doc.text('IVA:', totalsX, totalsY);
  doc.text(formatCurrency(factura.totalIva, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  totalsY += 10;
  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(1);
  doc.line(totalsX, totalsY - 4, pageWidth - 20, totalsY - 4);

  doc.setTextColor(239, 68, 68);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', totalsX, totalsY);
  doc.text(formatCurrency(factura.total, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  // Medical disclaimer
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Este recibo es un documento fiscal. Conservelo para cualquier reclamación.', 20, 270);

  // Stamp
  addStamp(doc, factura.estado, pageWidth / 2, 250, '#ef4444');

  return doc;
};

// Template: Construcción
const generateConstruccionPDF = (
  factura: Factura,
  cliente: Cliente | undefined,
  empresa: Empresa,
  rubro: Rubro
): jsPDFWithAutoTable => {
  const doc = generateBasePDF(factura, cliente, empresa, rubro);
  const pageWidth = doc.internal.pageSize.width;

  // Construction helmet icon area
  doc.setFillColor(249, 115, 22);
  doc.circle(pageWidth - 50, 25, 15, 'F');

  // Work info box
  const campos = factura.camposEspecificos || {};
  if (campos.direccionObra) {
    doc.setFillColor(254, 243, 199);
    doc.rect(20, 95, pageWidth - 40, 25, 'F');
    doc.setDrawColor(251, 191, 36);
    doc.setLineWidth(1);
    doc.rect(20, 95, pageWidth - 40, 25, 'S');
    
    doc.setTextColor(180, 83, 9);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DIRECCIÓN DE LA OBRA', 24, 103);
    
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(campos.direccionObra, 24, 110);
    
    if (campos.plazoEjecucion) {
      doc.text(`Plazo: ${campos.plazoEjecucion} días`, 24, 117);
    }
  }

  const startY = campos.direccionObra ? 130 : 110;

  // Items table
  const tableData = factura.lineas.map((linea) => [
    linea.descripcion,
    linea.cantidad.toString(),
    formatCurrency(linea.precioUnitario, empresa.moneda),
    formatCurrency(linea.total, empresa.moneda),
  ]);

  doc.autoTable({
    startY,
    head: [['Concepto', 'Ud.', 'Precio', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [249, 115, 22],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
  });

  const finalY = doc.lastAutoTable?.finalY || 150;

  // Totals with retention
  const totalsX = pageWidth - 80;
  let totalsY = finalY + 15;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Base imponible:', totalsX, totalsY);
  doc.text(formatCurrency(factura.subtotal, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  totalsY += 7;
  doc.text('IVA:', totalsX, totalsY);
  doc.text(formatCurrency(factura.totalIva, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  if (campos.retencionGarantia > 0) {
    totalsY += 7;
    const retencion = (factura.subtotal * campos.retencionGarantia) / 100;
    doc.text(`Retención (${campos.retencionGarantia}%):`, totalsX, totalsY);
    doc.text(`-${formatCurrency(retencion, empresa.moneda)}`, pageWidth - 20, totalsY, { align: 'right' });
  }

  totalsY += 10;
  doc.setDrawColor(249, 115, 22);
  doc.setLineWidth(1);
  doc.line(totalsX, totalsY - 4, pageWidth - 20, totalsY - 4);

  doc.setTextColor(249, 115, 22);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', totalsX, totalsY);
  doc.text(formatCurrency(factura.total, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  // Stamp
  addStamp(doc, factura.estado, pageWidth / 2, 270, '#f97316');

  return doc;
};

// Template: Abogacía
const generateAbogaciaPDF = (
  factura: Factura,
  cliente: Cliente | undefined,
  empresa: Empresa,
  rubro: Rubro
): jsPDFWithAutoTable => {
  const doc = generateBasePDF(factura, cliente, empresa, rubro);
  const pageWidth = doc.internal.pageSize.width;

  // Scale icon
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  doc.line(pageWidth - 70, 20, pageWidth - 50, 30);
  doc.line(pageWidth - 70, 30, pageWidth - 50, 20);
  doc.ellipse(pageWidth - 60, 25, 12, 8, 'S');

  // Case info
  const campos = factura.camposEspecificos || {};
  if (campos.expediente) {
    doc.setFillColor(241, 245, 249);
    doc.rect(20, 95, pageWidth - 40, 20, 'F');
    
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Expediente: ${campos.expediente}`, 24, 105);
    
    if (campos.materia) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Materia: ${campos.materia}`, 24, 112);
    }
  }

  const startY = campos.expediente ? 125 : 110;

  // Items table
  const tableData = factura.lineas.map((linea) => [
    linea.descripcion,
    linea.cantidad.toString(),
    formatCurrency(linea.precioUnitario, empresa.moneda),
    formatCurrency(linea.total, empresa.moneda),
  ]);

  doc.autoTable({
    startY,
    head: [['Concepto', 'Horas/Uds.', 'Precio', 'Importe']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [71, 85, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
  });

  const finalY = doc.lastAutoTable?.finalY || 150;

  // Honorarios label
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('HONORARIOS', pageWidth - 20, finalY + 10, { align: 'right' });

  // Totals
  const totalsX = pageWidth - 80;
  let totalsY = finalY + 20;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Base:', totalsX, totalsY);
  doc.text(formatCurrency(factura.subtotal, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  totalsY += 7;
  doc.text('IVA:', totalsX, totalsY);
  doc.text(formatCurrency(factura.totalIva, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  totalsY += 10;
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(1);
  doc.line(totalsX, totalsY - 4, pageWidth - 20, totalsY - 4);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL HONORARIOS:', totalsX, totalsY);
  doc.text(formatCurrency(factura.total, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  // Stamp
  addStamp(doc, factura.estado, pageWidth / 2, 270, '#475569');

  return doc;
};

// Template: Belleza
const generateBellezaPDF = (
  factura: Factura,
  cliente: Cliente | undefined,
  empresa: Empresa,
  _rubro: Rubro
): jsPDFWithAutoTable => {
  const doc = new jsPDF('p', 'mm', 'a4') as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.width;

  // Elegant header with gradient effect
  doc.setFillColor(244, 63, 94);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Decorative circles
  doc.setFillColor(251, 113, 133);
  doc.circle(pageWidth - 30, 20, 15, 'F');
  doc.setFillColor(253, 164, 175);
  doc.circle(pageWidth - 50, 15, 8, 'F');

  // Salon name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa.nombre, 20, 25);

  // Ticket title
  doc.setFontSize(28);
  doc.text('TICKET', pageWidth - 20, 25, { align: 'right' });

  // Ticket number
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${factura.numero}`, pageWidth - 20, 35, { align: 'right' });

  // Date
  doc.text(formatDate(factura.fechaEmision), 20, 50);

  // Client
  if (cliente) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Cliente: ${cliente.nombre}`, 20, 58);
  }

  // Items - ticket style
  let yPos = 70;
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);

  factura.lineas.forEach((linea) => {
    doc.setFont('helvetica', 'bold');
    doc.text(linea.descripcion, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(linea.total, empresa.moneda), pageWidth - 20, yPos, { align: 'right' });
    yPos += 8;
  });

  // Separator
  yPos += 5;
  doc.setDrawColor(244, 63, 94);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(20, yPos, pageWidth - 20, yPos);
  doc.setLineDashPattern([], 0);

  // Totals
  yPos += 15;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text('Subtotal:', 20, yPos);
  doc.text(formatCurrency(factura.subtotal, empresa.moneda), pageWidth - 20, yPos, { align: 'right' });

  yPos += 7;
  doc.text('IVA:', 20, yPos);
  doc.text(formatCurrency(factura.totalIva, empresa.moneda), pageWidth - 20, yPos, { align: 'right' });

  yPos += 12;
  doc.setFillColor(244, 63, 94);
  doc.rect(20, yPos - 8, pageWidth - 40, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', 25, yPos);
  doc.text(formatCurrency(factura.total, empresa.moneda), pageWidth - 25, yPos, { align: 'right' });

  // Thank you message
  yPos += 20;
  doc.setTextColor(244, 63, 94);
  doc.setFontSize(12);
  doc.text('¡Gracias por su visita!', pageWidth / 2, yPos, { align: 'center' });

  // Stamp
  addStamp(doc, factura.estado, pageWidth / 2, 250, '#f43f5e');

  return doc;
};

// Template: Automoción
const generateAutomocionPDF = (
  factura: Factura,
  cliente: Cliente | undefined,
  empresa: Empresa,
  rubro: Rubro
): jsPDFWithAutoTable => {
  const doc = generateBasePDF(factura, cliente, empresa, rubro);
  const pageWidth = doc.internal.pageSize.width;

  // Car icon area
  doc.setFillColor(220, 38, 38);
  doc.roundedRect(pageWidth - 80, 10, 60, 30, 5, 5, 'F');

  // Vehicle info box
  doc.setFillColor(254, 226, 226);
  doc.rect(20, 95, pageWidth - 40, 30, 'F');
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(1);
  doc.rect(20, 95, pageWidth - 40, 30, 'S');

  doc.setTextColor(153, 27, 27);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL VEHÍCULO', 24, 103);

  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  
  const campos = factura.camposEspecificos || {};
  if (campos.matricula) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Matrícula: ${campos.matricula}`, 24, 112);
    doc.setFont('helvetica', 'normal');
  }
  if (campos.vehiculo) {
    doc.text(campos.vehiculo, 24, 119);
  }
  if (campos.km) {
    doc.text(`Kilometraje: ${campos.km.toLocaleString()} km`, pageWidth / 2, 112);
  }

  // Items table
  const tableData = factura.lineas.map((linea) => [
    linea.descripcion,
    linea.cantidad.toString(),
    formatCurrency(linea.precioUnitario, empresa.moneda),
    formatCurrency(linea.total, empresa.moneda),
  ]);

  doc.autoTable({
    startY: 135,
    head: [['Concepto', 'Ud.', 'PVP', 'Importe']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [220, 38, 38],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
  });

  const finalY = doc.lastAutoTable?.finalY || 170;

  // Totals
  const totalsX = pageWidth - 80;
  let totalsY = finalY + 15;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Importe:', totalsX, totalsY);
  doc.text(formatCurrency(factura.subtotal, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  totalsY += 7;
  doc.text('IVA:', totalsX, totalsY);
  doc.text(formatCurrency(factura.totalIva, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  totalsY += 10;
  doc.setFillColor(220, 38, 38);
  doc.rect(totalsX, totalsY - 8, pageWidth - totalsX - 20, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', totalsX + 5, totalsY);
  doc.text(formatCurrency(factura.total, empresa.moneda), pageWidth - 25, totalsY, { align: 'right' });

  // Warranty
  if (campos.garantia) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Garantía: ${campos.garantia} meses`, 20, 270);
  }

  // Stamp
  addStamp(doc, factura.estado, pageWidth / 2, 250, '#dc2626');

  return doc;
};

// Template: Hostelería
const generateHosteleriaPDF = (
  factura: Factura,
  cliente: Cliente | undefined,
  empresa: Empresa,
  rubro: Rubro
): jsPDFWithAutoTable => {
  const doc = generateBasePDF(factura, cliente, empresa, rubro);
  const pageWidth = doc.internal.pageSize.width;

  // Fork and knife decoration
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  // Fork
  doc.line(pageWidth - 75, 18, pageWidth - 75, 32);
  doc.line(pageWidth - 78, 18, pageWidth - 78, 25);
  doc.line(pageWidth - 72, 18, pageWidth - 72, 25);
  // Knife
  doc.line(pageWidth - 65, 18, pageWidth - 65, 32);
  doc.line(pageWidth - 62, 18, pageWidth - 62, 28);

  // Stay info
  const campos = factura.camposEspecificos || {};
  if (campos.fechaEntrada || campos.habitacion) {
    doc.setFillColor(255, 247, 237);
    doc.rect(20, 95, pageWidth - 40, 25, 'F');
    doc.setDrawColor(251, 146, 60);
    doc.setLineWidth(0.5);
    doc.rect(20, 95, pageWidth - 40, 25, 'S');

    doc.setTextColor(234, 88, 12);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DE ESTANCIA', 24, 103);

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    
    let infoText = '';
    if (campos.habitacion) {
      infoText += `Hab/Mesa: ${campos.habitacion}  `;
    }
    if (campos.fechaEntrada) {
      infoText += `Entrada: ${formatDate(campos.fechaEntrada)}  `;
    }
    if (campos.fechaSalida) {
      infoText += `Salida: ${formatDate(campos.fechaSalida)}`;
    }
    doc.text(infoText, 24, 112);
  }

  const startY = (campos.fechaEntrada || campos.habitacion) ? 130 : 110;

  // Items table
  const tableData = factura.lineas.map((linea) => [
    linea.descripcion,
    linea.cantidad.toString(),
    formatCurrency(linea.precioUnitario, empresa.moneda),
    formatCurrency(linea.total, empresa.moneda),
  ]);

  doc.autoTable({
    startY,
    head: [['Concepto', 'Cant.', 'Precio', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [234, 88, 12],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
  });

  const finalY = doc.lastAutoTable?.finalY || 150;

  // Totals
  const totalsX = pageWidth - 80;
  let totalsY = finalY + 15;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Base:', totalsX, totalsY);
  doc.text(formatCurrency(factura.subtotal, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  totalsY += 7;
  doc.text('IVA:', totalsX, totalsY);
  doc.text(formatCurrency(factura.totalIva, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  totalsY += 10;
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(1);
  doc.line(totalsX, totalsY - 4, pageWidth - 20, totalsY - 4);

  doc.setTextColor(234, 88, 12);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', totalsX, totalsY);
  doc.text(formatCurrency(factura.total, empresa.moneda), pageWidth - 20, totalsY, { align: 'right' });

  // Stamp
  addStamp(doc, factura.estado, pageWidth / 2, 270, '#ea580c');

  return doc;
};

// Main export function
export const generateInvoicePDF = (
  factura: Factura,
  cliente: Cliente | undefined,
  empresa: Empresa
): jsPDF => {
  const rubro = getRubroById(empresa.rubroPrincipal);
  
  if (!rubro) {
    return generateDefaultPDF(factura, cliente, empresa, rubros[rubros.length - 1]);
  }

  // Select template based on rubro
  switch (rubro.plantillaPDF) {
    case 'medico':
      return generateMedicoPDF(factura, cliente, empresa, rubro);
    case 'construccion':
      return generateConstruccionPDF(factura, cliente, empresa, rubro);
    case 'abogacia':
      return generateAbogaciaPDF(factura, cliente, empresa, rubro);
    case 'belleza':
      return generateBellezaPDF(factura, cliente, empresa, rubro);
    case 'automocion':
      return generateAutomocionPDF(factura, cliente, empresa, rubro);
    case 'hosteleria':
      return generateHosteleriaPDF(factura, cliente, empresa, rubro);
    default:
      return generateDefaultPDF(factura, cliente, empresa, rubro);
  }
};

// Download PDF
export const downloadInvoicePDF = (
  factura: Factura,
  cliente: Cliente | undefined,
  empresa: Empresa
): void => {
  const doc = generateInvoicePDF(factura, cliente, empresa);
  doc.save(`${factura.numero}.pdf`);
};

// Get PDF as blob
export const getInvoicePDFBlob = (
  factura: Factura,
  cliente: Cliente | undefined,
  empresa: Empresa
): Blob => {
  const doc = generateInvoicePDF(factura, cliente, empresa);
  return doc.output('blob');
};
