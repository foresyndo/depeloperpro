// Utility helpers for DeveloperPro ERP

/**
 * Formats a number as Indonesian Rupiah (IDR)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Simulates exporting a dataset to an Excel or CSV sheet
 */
export function exportToExcel(data: any[], filename: string): void {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }
  
  // Create CSV format
  const headers = Object.keys(data[0]);
  const rows = data.map(item => 
    headers.map(header => {
      const val = item[header];
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates the local URL for E-Signature verification QR codes
 */
export function generateQRUrl(docId: string): string {
  // Returns a simulated verification URL of this document scanned
  const base = window.location.origin;
  return `${base}/api/docs/verify-qr?docId=${docId}`;
}
