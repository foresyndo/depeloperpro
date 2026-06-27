export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  company: string;
  phone: string;
}

export const STAKEHOLDER_DIRECTORY: Stakeholder[] = [
  { id: 'STK-01', name: 'Ir. Bambang Wijayanto', role: 'Direktur Utama', company: 'PT Adi Jaya Konstruksi', phone: '081234567890' },
  { id: 'STK-02', name: 'Denny Setiawan', role: 'Project Manager Struktur', company: 'PT Hutama Jaya', phone: '081122334455' },
  { id: 'STK-03', name: 'Rudi Hermawan', role: 'Kepala Pengawas MEP', company: 'CV Sinar Terang Abadi', phone: '081388990022' },
  { id: 'STK-04', name: 'Haji Sulaiman', role: 'Pemilik Lahan', company: 'Pribadi (Kavling Menteng)', phone: '081299887766' },
  { id: 'STK-05', name: 'Ibu Ratna Kumala', role: 'Mitra Pemilik Lahan Akses', company: 'Pribadi (Akses Jalan)', phone: '081544332211' }
];

export function buildProcurementPOTemplate(name: string, company: string, poNumber: string, totalValue: string, jobDesc: string): string {
  return `Halo *${name}* dari *${company}*,

Kami menginfokan bahwa Surat Perintah Kerja / Purchase Order (PO) baru telah diterbitkan oleh PT DeveloperPro ERP:

- *No. PO*: ${poNumber}
- *Pekerjaan*: ${jobDesc}
- *Nilai Kontrak*: ${totalValue}
- *Status*: Approved & Dispatched

Harap segera menindaklanjuti pekerjaan di lapangan sesuai jadwal koordinasi. Terima kasih.
_DeveloperPro ERP Dispatcher_`;
}

export function buildDocumentStepApprovedTemplate(docTitle: string, docVersion: string, stepName: string, approverName: string, nextStatus: string): string {
  return `Yth. Anggota Tim Proyek,

E-Signature Workflow berhasil diperbarui untuk dokumen berikut:

- *Judul Dokumen*: ${docTitle}
- *Versi*: v${docVersion}
- *Tahap Persetujuan*: ${stepName}
- *Oleh*: ${approverName}
- *Status Akhir*: *${nextStatus}*

Dokumen siap diakses di Document Hub ERP DeveloperPro.
_DeveloperPro E-Signature System_`;
}

export function buildProjectMilestoneTemplate(milestoneName: string, projectName: string, planEnd: string, actEnd: string): string {
  return `Notifikasi Pencapaian Proyek (Milestone Completed)!

Selamat kepada tim, pekerjaan lapangan berikut telah selesai dikerjakan dan diverifikasi:

- *Milestone*: ${milestoneName}
- *Proyek*: ${projectName}
- *Target Selesai*: ${planEnd}
- *Realisasi Selesai*: ${actEnd}
- *Status Kemajuan*: *SELESAI (100% Verified)*

Termin penagihan (invoice progress) sudah dapat diajukan ke divisi Keuangan. Terima kasih atas kerja kerasnya!
_DeveloperPro Project Monitor_`;
}

/**
 * Fires a request to the backend server to send a WhatsApp message
 */
export async function sendWhatsAppNotification(
  phone: string,
  recipientName: string,
  role: string,
  message: string,
  type: 'Procurement PO' | 'Document Approval' | 'Project Milestone' | 'Manual'
): Promise<{ success: boolean; error?: string; log?: any }> {
  try {
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, recipientName, role, message, type })
    });
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, log: data.log };
    } else {
      const errData = await response.json();
      return { success: false, error: errData.error || 'Kesalahan Server' };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal tersambung ke server' };
  }
}
