import { jsPDF } from 'jspdf';
import { Project, Sales } from '../types';
import { formatRupiah } from './helpers';

export function exportReportToPDF(sales: Sales[], projects: Project[]): void {
  // Create jsPDF instance with A4 size
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2); // 180mm

  let currentY = 15;

  // Helper function to check space and add page if needed
  function checkSpace(heightNeeded: number): void {
    if (currentY + heightNeeded > pageHeight - margin - 15) {
      doc.addPage();
      currentY = 20; // reset to top with spacing
    }
  }

  // --- Title & Branding Header ---
  doc.setFillColor(15, 23, 42); // Navy Blue / Dark Slate
  doc.rect(margin, currentY, contentWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('WIJAYA KARYA CIPTA PROPERTY GROUP', margin + 8, currentY + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(16, 185, 129); // Accent Emerald
  doc.text('DEVELOPERPRO ENTERPRISE ERP • SYSTEM LAPORAN EKSEKUTIF', margin + 8, currentY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('LAPORAN RINGKASAN SALES & PROGRESS KONSTRUKSI', margin + 8, currentY + 24);

  // Print Date metadata right side of the header banner
  const todayStr = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Dicetak: ${todayStr}`, margin + contentWidth - 8, currentY + 10, { align: 'right' });
  doc.text('Status: CONFIDENTIAL / INTERNAL', margin + contentWidth - 8, currentY + 16, { align: 'right' });

  currentY += 38;

  // --- Executive KPI Summary (Bento Boxes) ---
  checkSpace(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('I. RINGKASAN EKSEKUTIF UTAMA', margin, currentY);
  
  // Underline
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY + 2, margin + contentWidth, currentY + 2);
  currentY += 6;

  // Calculate Metrics
  const totalBookedUnits = sales.length;
  const totalSalesValue = sales.reduce((acc, s) => acc + s.totalPrice, 0);
  const totalBookingFeeIn = sales.reduce((acc, s) => acc + s.bookingFee, 0);
  
  const totalLandSqm = projects.reduce((acc, p) => 
    acc + p.landAcquisitions.reduce((lAcc, l) => lAcc + l.areaSqm, 0)
  , 0);

  const allMilestones = projects.flatMap(p => p.milestones);
  const avgProgress = allMilestones.length > 0 
    ? Math.round(allMilestones.reduce((acc, m) => acc + m.progressPercentage, 0) / allMilestones.length)
    : 0;

  // Draw 4 bento grids for KPIs
  const boxWidth = (contentWidth - 9) / 4; // 4 boxes with 3mm gap
  const boxHeight = 20;
  const boxY = currentY;

  // Helper to draw clean KPI Box
  const drawKPIBox = (x: number, title: string, value: string, subtext: string, bgColor: [number, number, number], textColor: [number, number, number]) => {
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.roundedRect(x, boxY, boxWidth, boxHeight, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, boxY, boxWidth, boxHeight, 2, 2, 'D');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(title.toUpperCase(), x + 4, boxY + 5);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(value, x + 4, boxY + 11);

    // Subtext
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(subtext, x + 4, boxY + 16);
  };

  drawKPIBox(margin, 'Unit Terbooking', `${totalBookedUnits} Kavling`, 'Akumulasi Semua Proyek', [255, 255, 255], [5, 150, 105]);
  drawKPIBox(margin + boxWidth + 3, 'Volume Penjualan', formatRupiah(totalSalesValue), `BF Masuk: ${formatRupiah(totalBookingFeeIn)}`, [255, 255, 255], [15, 23, 42]);
  drawKPIBox(margin + (boxWidth + 3) * 2, 'Konstruksi Fisik', `${avgProgress}% Selesai`, 'Rata-rata Kemajuan Milestones', [255, 255, 255], [124, 58, 237]);
  drawKPIBox(margin + (boxWidth + 3) * 3, 'Lahan Terbebaskan', `${totalLandSqm.toLocaleString('id-ID')} m²`, 'Sertifikasi SHM/HGB Clean', [255, 255, 255], [217, 119, 6]);

  currentY += boxHeight + 8;

  // --- Section II: Detail Penjualan (Sales) ---
  checkSpace(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('II. RINCIAN DATA PENJUALAN UNIT (SALES)', margin, currentY);
  
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY + 2, margin + contentWidth, currentY + 2);
  currentY += 6;

  // Sales Table Header
  const salesColWidths = {
    id: 15,
    buyer: 35,
    project: 35,
    unit: 18,
    price: 32,
    method: 23,
    status: 22
  };

  const drawSalesTableHeader = (y: number) => {
    doc.setFillColor(241, 245, 249); // light slate background
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);

    let startX = margin + 2;
    doc.text('ID', startX, y + 4.5);
    startX += salesColWidths.id;
    doc.text('NAMA PEMBELI', startX, y + 4.5);
    startX += salesColWidths.buyer;
    doc.text('NAMA PROYEK', startX, y + 4.5);
    startX += salesColWidths.project;
    doc.text('KODE UNIT', startX, y + 4.5);
    startX += salesColWidths.unit;
    doc.text('TOTAL HARGA', startX, y + 4.5);
    startX += salesColWidths.price;
    doc.text('METODE', startX, y + 4.5);
    startX += salesColWidths.method;
    doc.text('STATUS', startX, y + 4.5);
  };

  drawSalesTableHeader(currentY);
  currentY += 7;

  // Sales Table Body Row
  sales.forEach((s, idx) => {
    checkSpace(8);
    // If we just wrapped to a new page, redraw table header
    if (currentY === 20) {
      drawSalesTableHeader(currentY);
      currentY += 7;
    }

    // Zebra striping
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, contentWidth, 7.5, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    let startX = margin + 2;
    // ID
    doc.text(s.id, startX, currentY + 5);
    startX += salesColWidths.id;
    // Buyer
    doc.setFont('helvetica', 'bold');
    doc.text(s.customerName, startX, currentY + 5);
    doc.setFont('helvetica', 'normal');
    startX += salesColWidths.buyer;
    // Project
    doc.text(s.projectName, startX, currentY + 5);
    startX += salesColWidths.project;
    // Unit Code
    doc.text(s.unitCode, startX, currentY + 5);
    startX += salesColWidths.unit;
    // Price
    doc.text(formatRupiah(s.totalPrice), startX, currentY + 5);
    startX += salesColWidths.price;
    // Method
    doc.text(s.paymentMethod, startX, currentY + 5);
    startX += salesColWidths.method;
    
    // Status Badge Coloring
    const statusText = s.status;
    if (statusText === 'Akad' || statusText === 'Handover') {
      doc.setTextColor(5, 150, 105); // Green
    } else if (statusText === 'DP_Paid' || statusText === 'SPU') {
      doc.setTextColor(37, 99, 235); // Blue
    } else {
      doc.setTextColor(217, 119, 6); // Amber
    }
    doc.setFont('helvetica', 'bold');
    doc.text(statusText, startX, currentY + 5);
    
    currentY += 7.5;
  });

  currentY += 5;

  // --- Section III: Kemajuan Proyek & Konstruksi ---
  checkSpace(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('III. KEMAJUAN PROYEK & KONTROL TEKNIS KONSTRUKSI', margin, currentY);
  
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY + 2, margin + contentWidth, currentY + 2);
  currentY += 6;

  projects.forEach((proj, pIdx) => {
    checkSpace(35);
    if (currentY === 20) {
      currentY += 5;
    }

    // Project title panel
    doc.setFillColor(15, 23, 42); // slate navy background
    doc.rect(margin, currentY, contentWidth, 6.5, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`PROYEK #${pIdx + 1}: ${proj.name.toUpperCase()} - LOKASI: ${proj.location.toUpperCase()}`, margin + 3, currentY + 4.5);
    currentY += 6.5;

    // Sub metrics for this project
    checkSpace(18);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, currentY, contentWidth, 14, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, currentY, contentWidth, 14, 'D');

    // Calculate details
    const projMilestones = proj.milestones;
    const projProgress = projMilestones.length > 0 
      ? Math.round(projMilestones.reduce((acc, m) => acc + m.progressPercentage, 0) / projMilestones.length)
      : 0;
    const dpPaidLand = proj.landAcquisitions.filter(l => l.status === 'DP_Paid' || l.status === 'Fully_Paid' || l.status === 'Deal').length;
    const totalLand = proj.landAcquisitions.length;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('RATA-RATA PROGRES FISIK', margin + 4, currentY + 5);
    doc.text('PEMBEBASAN LAHAN', margin + 65, currentY + 5);
    doc.text('TOTAL BUDGET PROYEK', margin + 125, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${projProgress}% Selesai`, margin + 4, currentY + 10.5);
    doc.text(`${dpPaidLand} dari ${totalLand} Kavling Deal`, margin + 65, currentY + 10.5);
    doc.text(formatRupiah(proj.totalBudget), margin + 125, currentY + 10.5);

    currentY += 18;

    // Table of Milestones for this project
    checkSpace(20);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, 6, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('PEKERJAAN / MILESTONE UTAMA', margin + 4, currentY + 4);
    doc.text('KONTRAKTOR UTAMA', margin + 70, currentY + 4);
    doc.text('BOBOT', margin + 120, currentY + 4);
    doc.text('KEMAJUAN (%)', margin + 145, currentY + 4);
    doc.text('STATUS', margin + 165, currentY + 4);
    
    currentY += 6;

    projMilestones.forEach((m, mIdx) => {
      checkSpace(7);
      if (mIdx % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, currentY, contentWidth, 6.5, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);

      doc.text(m.name, margin + 4, currentY + 4.5);
      doc.text(m.contractorName, margin + 70, currentY + 4.5);
      doc.text(`${m.weightPercentage}%`, margin + 120, currentY + 4.5);
      
      // Draw a small visual progress bar
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin + 145, currentY + 2.2, 15, 2.5, 0.5, 0.5, 'FD');
      
      doc.setFillColor(124, 58, 237); // Purple
      const barFilledWidth = (m.progressPercentage / 100) * 15;
      if (barFilledWidth > 0) {
        doc.roundedRect(margin + 145, currentY + 2.2, barFilledWidth, 2.5, 0.5, 0.5, 'F');
      }
      doc.text(`${m.progressPercentage}%`, margin + 145 + 16, currentY + 4.5);

      const status = m.status;
      if (status === 'Completed') {
        doc.setTextColor(5, 150, 105);
      } else if (status === 'In_Progress') {
        doc.setTextColor(37, 99, 235);
      } else {
        doc.setTextColor(225, 29, 72); // Red
      }
      doc.setFont('helvetica', 'bold');
      doc.text(status, margin + 165, currentY + 4.5);
      doc.setFont('helvetica', 'normal');

      currentY += 6.5;
    });

    // Output recent activities from construction logs
    if (proj.constructionLogs && proj.constructionLogs.length > 0) {
      checkSpace(18);
      currentY += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text('Log Kegiatan Lapangan Terakhir (Laporan Konstruksi):', margin + 4, currentY);
      currentY += 4;

      const recentLog = proj.constructionLogs[0];
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      
      const detailsStr = `Tanggal: ${recentLog.date} | Cuaca: ${recentLog.weather} | Jumlah Tenaga Kerja: ${recentLog.laborCount} Orang | Pelapor: ${recentLog.reporter}`;
      doc.text(detailsStr, margin + 6, currentY);
      currentY += 3.5;

      doc.setFont('helvetica', 'bold');
      doc.text('Aktivitas: ', margin + 6, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(recentLog.activities, margin + 18, currentY);
      currentY += 3.5;

      if (recentLog.issues) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(225, 29, 72);
        doc.text('Kendala Lapangan: ', margin + 6, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(recentLog.issues, margin + 30, currentY);
        doc.setTextColor(71, 85, 105);
        currentY += 3.5;
      }
    }

    currentY += 8; // spacing between projects
  });

  // --- Draw Pages Count Footers and Header Borders ---
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Draw running thin top bar
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, 10, margin + contentWidth, 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text('DEVELOPERPRO ENTERPRISE ERP SYSTEM • SECURE DATA TRANSMISSION', margin, 9);

    // Draw running bottom bar
    doc.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);
    
    doc.text(`WIJAYA KARYA CIPTA PROPERTY GROUP • LAPORAN STAKEHOLDER PROYEK & SALES`, margin, pageHeight - 9);
    doc.text(`Halaman ${i} dari ${totalPages}`, margin + contentWidth, pageHeight - 9, { align: 'right' });
  }

  // Save the generated document directly in the user browser tab
  doc.save(`Laporan_Stakeholder_Sales_Konstruksi_${new Date().toISOString().slice(0, 10)}.pdf`);
}
