import { Project, Sales, MarketingCampaign, CSComplaint, HRDEmployee, DocumentHub, SOPItem, FormItem, AuditLog } from '../types';

export const initialProjects: Project[] = [
  {
    id: 'PRJ-001',
    name: 'Menteng Heights Residence',
    location: 'Jakarta Pusat',
    totalBudget: 75000000000,
    landAcquisitions: [
      {
        id: 'LND-01',
        location: 'Kavling Menteng Barat',
        areaSqm: 4500,
        pricePerMeter: 12000000,
        totalPrice: 54000000000,
        ownerName: 'Haji Sulaiman',
        status: 'Fully_Paid',
        notaryName: 'Kartika Sari, S.H., M.Kn.',
        shmNumber: 'SHM No. 892/Menteng',
        notes: 'Sertifikat sudah beralih nama ke PT Wijaya Karya Cipta.'
      },
      {
        id: 'LND-02',
        location: 'Kavling Akses Jalan Utama',
        areaSqm: 800,
        pricePerMeter: 15000000,
        totalPrice: 12000000000,
        ownerName: 'Ibu Ratna',
        status: 'DP_Paid',
        notaryName: 'Kartika Sari, S.H., M.Kn.',
        shmNumber: 'HGB No. 1202/Menteng',
        notes: 'Sisa pembayaran termin 2 sebesar Rp 4 Milyar dibayar akhir Juni 2026.'
      }
    ],
    legalDocuments: [
      { id: 'LGL-01', name: 'Izin Prinsip Pembangunan', category: 'Izin_Prinsip', issuedDate: '2025-01-10', expiryDate: '2028-01-10', issuer: 'Pemerintah Provinsi DKI Jakarta', status: 'Approved' },
      { id: 'LGL-02', name: 'Persetujuan Bangunan Gedung (PBG)', category: 'PBG', issuedDate: '2025-05-15', expiryDate: '2030-05-15', issuer: 'Dinas Penataan Kota DKI', status: 'Approved' },
      { id: 'LGL-03', name: 'Analisis Mengenai Dampak Lingkungan (AMDAL)', category: 'AMD_SOP', issuedDate: '2025-03-20', expiryDate: '2035-03-20', issuer: 'Kementerian LHK', status: 'Approved' },
      { id: 'LGL-04', name: 'Pecah Sertifikat Induk', category: 'Sertifikat_Induk', issuedDate: '2025-08-01', expiryDate: '2035-08-01', issuer: 'BPN Jakarta Pusat', status: 'In_Progress' }
    ],
    milestones: [
      { id: 'MLS-101', name: 'Persiapan Lahan & Land Clearing', weightPercentage: 10, plannedStartDate: '2026-01-01', plannedEndDate: '2026-01-31', actualStartDate: '2026-01-01', actualEndDate: '2026-01-28', progressPercentage: 100, contractorName: 'PT Adi Jaya Konstruksi', status: 'Completed' },
      { id: 'MLS-102', name: 'Pekerjaan Pondasi Pancang (Piling)', weightPercentage: 15, plannedStartDate: '2026-02-01', plannedEndDate: '2026-03-15', actualStartDate: '2026-02-03', actualEndDate: '2026-03-20', progressPercentage: 100, contractorName: 'PT Adi Jaya Konstruksi', status: 'Completed' },
      { id: 'MLS-103', name: 'Pekerjaan Struktur Basement', weightPercentage: 20, plannedStartDate: '2026-03-16', plannedEndDate: '2026-05-31', actualStartDate: '2026-03-18', actualEndDate: '2026-06-05', progressPercentage: 100, contractorName: 'PT Hutama Jaya', status: 'Completed' },
      { id: 'MLS-104', name: 'Pekerjaan Struktur Kolom & Balok Lantai 1-5', weightPercentage: 25, plannedStartDate: '2026-06-01', plannedEndDate: '2026-09-30', actualStartDate: '2026-06-02', progressPercentage: 35, contractorName: 'PT Hutama Jaya', status: 'In_Progress' },
      { id: 'MLS-105', name: 'Arsitektur, MEP & Kelistrikan', weightPercentage: 20, plannedStartDate: '2026-10-01', plannedEndDate: '2026-12-15', progressPercentage: 0, contractorName: 'CV Sinar Terang Abadi', status: 'Not_Started' },
      { id: 'MLS-106', name: 'Finishing & Landscape Taman', weightPercentage: 10, plannedStartDate: '2026-12-16', plannedEndDate: '2027-01-31', progressPercentage: 0, contractorName: 'CV Green Harmoni', status: 'Not_Started' }
    ],
    constructionLogs: [
      { id: 'LOG-01', date: '2026-06-25', weather: 'Sunny', laborCount: 85, materialsDelivered: 'Semen Padang 400 sak, Besi Ulir D16 120 batang, Pasir Beton 3 dump truck', activities: 'Pengecoran plat lantai lantai 2 zona B, fabrikasi tulangan balok lantai 3.', issues: 'Tidak ada kendala berarti. Cuaca mendukung.', reporter: 'Ir. Ahmad Fauzi (PM)' },
      { id: 'LOG-02', date: '2026-06-26', weather: 'Rainy', laborCount: 60, materialsDelivered: 'Ready mix K-350 Adhimix 5 mixer truck', activities: 'Pekerjaan dihentikan sementara pukul 13:00 - 15:30 karena hujan lebat. Melanjutkan instalasi elektrikal pipa conduit di area teduh.', issues: 'Keterlambatan supply beton 2 jam karena lalu lintas banjir.', reporter: 'Ir. Ahmad Fauzi (PM)' }
    ]
  },
  {
    id: 'PRJ-002',
    name: 'Griya Asri Residence',
    location: 'Bogor',
    totalBudget: 35000000000,
    landAcquisitions: [
      {
        id: 'LND-03',
        location: 'Tanah Sawah Girang',
        areaSqm: 12000,
        pricePerMeter: 1500000,
        totalPrice: 18000000000,
        ownerName: 'H. Abdul Hadi',
        status: 'Fully_Paid',
        notaryName: 'Lukman Hakim, S.H.',
        shmNumber: 'SHM No. 441/Cilebut',
        notes: 'Sertifikat sudah clear and clean, proses AJB selesai.'
      }
    ],
    legalDocuments: [
      { id: 'LGL-05', name: 'Izin Prinsip Bupati', category: 'Izin_Prinsip', issuedDate: '2024-05-10', expiryDate: '2027-05-10', issuer: 'Pemerintah Kabupaten Bogor', status: 'Approved' },
      { id: 'LGL-06', name: 'Pecah Sertifikat Kavling Perumahan', category: 'Sertifikat_Induk', issuedDate: '2024-11-20', expiryDate: '2029-11-20', issuer: 'BPN Kab Bogor', status: 'Approved' },
      { id: 'LGL-07', name: 'PBG Unit Rumah Sederhana', category: 'PBG', issuedDate: '2025-02-12', expiryDate: '2030-02-12', issuer: 'DPMPTSP Kab Bogor', status: 'Approved' }
    ],
    milestones: [
      { id: 'MLS-201', name: 'Land Clearing & Cut and Fill', weightPercentage: 20, plannedStartDate: '2025-08-01', plannedEndDate: '2025-09-30', actualStartDate: '2025-08-01', actualEndDate: '2025-09-25', progressPercentage: 100, contractorName: 'PT Swadaya Mandiri', status: 'Completed' },
      { id: 'MLS-202', name: 'Infrastruktur Jalan & Saluran Air', weightPercentage: 30, plannedStartDate: '2025-10-01', plannedEndDate: '2026-02-28', actualStartDate: '2025-10-05', actualEndDate: '2026-03-10', progressPercentage: 100, contractorName: 'PT Swadaya Mandiri', status: 'Completed' },
      { id: 'MLS-203', name: 'Pembangunan Struktur Unit Cluster A', weightPercentage: 30, plannedStartDate: '2026-03-01', plannedEndDate: '2026-08-31', actualStartDate: '2026-03-05', progressPercentage: 70, contractorName: 'CV Bogor Utama', status: 'In_Progress' },
      { id: 'MLS-204', name: 'Utilitas Listrik, Air & Gerbang Utama', weightPercentage: 20, plannedStartDate: '2026-09-01', plannedEndDate: '2026-11-30', progressPercentage: 0, contractorName: 'CV Bogor Utama', status: 'Not_Started' }
    ],
    constructionLogs: [
      { id: 'LOG-03', date: '2026-06-25', weather: 'Cloudy', laborCount: 42, materialsDelivered: 'Bata Ringan Hebel 40 kubik, Semen Mortar MU 100 sak', activities: 'Pemasangan dinding bata ringan lantai 1 Cluster A-05 s.d A-08. Pengecor ring balok Cluster A-01.', issues: 'Tidak ada kendala.', reporter: 'Ir. Dian Wijaya (PM)' }
    ]
  }
];

export const initialSales: Sales[] = [
  {
    id: 'SLS-001',
    customerName: 'Irwan Setiawan',
    nik: '3171012304850001',
    kkNumber: '3171012309110002',
    address: 'Jl. Kemang Timur No. 14A, Mampang Prapatan, Jakarta Selatan',
    phoneNumber: '08129876543',
    projectName: 'Menteng Heights Residence',
    unitCode: 'A-12A',
    bookingFee: 50000000,
    bookingDate: '2026-04-10',
    paymentMethod: 'KPR',
    dpAmount: 450000000,
    totalPrice: 4500000000,
    status: 'Akad',
    marketingCommission: 135000000,
    salesCommission: 45000000
  },
  {
    id: 'SLS-002',
    customerName: 'Wati Handayani',
    nik: '3201024508820003',
    kkNumber: '3201024510090005',
    address: 'Perumahan Pajajaran Indah Blok C No. 4, Bogor Timur',
    phoneNumber: '081311223344',
    projectName: 'Griya Asri Residence',
    unitCode: 'M-15',
    bookingFee: 10000000,
    bookingDate: '2026-05-18',
    paymentMethod: 'Cash Keras',
    dpAmount: 0,
    totalPrice: 1200000000,
    status: 'Handover',
    marketingCommission: 36000000,
    salesCommission: 12000000
  },
  {
    id: 'SLS-003',
    customerName: 'Marcus Aurelius',
    nik: '3174091212800002',
    kkNumber: '3174091212150001',
    address: 'Apartemen Menteng Executive Penthouse No. 5, Jakarta Pusat',
    phoneNumber: '081122334455',
    projectName: 'Menteng Heights Residence',
    unitCode: 'B-25B (Penthouse)',
    bookingFee: 100000000,
    bookingDate: '2026-06-01',
    paymentMethod: 'Cash Bertahap',
    dpAmount: 1800000000,
    totalPrice: 9500000000,
    status: 'SPU',
    marketingCommission: 285000000,
    salesCommission: 95000000
  },
  {
    id: 'SLS-004',
    customerName: 'Ferry Salim',
    nik: '3172051502750004',
    kkNumber: '3172051511120008',
    address: 'Perum Gading Serpong Sektor 3, Tangerang',
    phoneNumber: '081877665544',
    projectName: 'Griya Asri Residence',
    unitCode: 'S-40',
    bookingFee: 10000000,
    bookingDate: '2026-06-20',
    paymentMethod: 'KPR',
    dpAmount: 120000000,
    totalPrice: 1100000000,
    status: 'Booking',
    marketingCommission: 33000000,
    salesCommission: 11000000
  }
];

export const initialCampaigns: MarketingCampaign[] = [
  { id: 'CMP-01', name: 'Grand Launching Menteng Heights Penthouse', channel: 'Instagram Ads', budget: 45000000, leadsAcquired: 320, conversions: 5, startDate: '2026-05-01', endDate: '2026-05-31', status: 'Completed' },
  { id: 'CMP-02', name: 'Bogor Home Property Expo 2026', channel: 'Property Expo', budget: 120000000, leadsAcquired: 450, conversions: 12, startDate: '2026-06-10', endDate: '2026-06-17', status: 'Completed' },
  { id: 'CMP-03', name: 'Digital Campaign Griya Asri Cluster A', channel: 'Facebook Ads', budget: 25000000, leadsAcquired: 180, conversions: 3, startDate: '2026-06-01', endDate: '2026-06-30', status: 'Active' },
  { id: 'CMP-04', name: 'Billboard Megatron Sudirman Jakarta', channel: 'Billboards', budget: 150000000, leadsAcquired: 150, conversions: 1, startDate: '2026-07-01', endDate: '2026-12-31', status: 'Planned' }
];

export const initialCSComplaints: CSComplaint[] = [
  { id: 'CMPL-101', customerName: 'Ferry Salim', unitCode: 'S-40', issueType: 'Kebocoran Atap', description: 'Atap bocor di bagian kamar tidur utama saat terjadi hujan deras.', reportedDate: '2026-06-22', status: 'Repair_In_Progress', resolutionDetails: 'Tukang sedang membongkar genteng untuk memperbaiki talang air yang pecah.' },
  { id: 'CMPL-102', customerName: 'Wati Handayani', unitCode: 'M-15', issueType: 'Struktur Retak', description: 'Ada keretakan rambut di dinding ruang tamu dekat pilar utama.', reportedDate: '2026-06-24', status: 'Investigating' },
  { id: 'CMPL-103', customerName: 'Andi Wijaya', unitCode: 'A-02', issueType: 'Kelistrikan', description: 'Saklar sirkuit listrik sering jepret sendiri saat menyalakan water heater.', reportedDate: '2026-06-20', status: 'Resolved', resolutionDetails: 'Selesai diganti MCB baru dengan kapasitas daya yang sesuai oleh teknisi perumahan.' }
];

export const initialEmployees: HRDEmployee[] = [
  { id: 'EMP-001', name: 'Hendra Setiawan, S.E.', role: 'Chief Financial Officer (CFO)', department: 'Finance', status: 'Active', hireDate: '2020-01-15', salary: 35000000, performanceScore: 4.8 },
  { id: 'EMP-002', name: 'Ir. Ahmad Fauzi', role: 'Senior Project Manager (PM)', department: 'Project', status: 'Active', hireDate: '2021-04-01', salary: 28000000, performanceScore: 4.5 },
  { id: 'EMP-003', name: 'Siti Rahmawati, S.I.Kom', role: 'Head of Marketing & Sales', department: 'Marketing', status: 'Active', hireDate: '2022-09-10', salary: 22000000, performanceScore: 4.2 },
  { id: 'EMP-004', name: 'Rian Hidayat, S.H.', role: 'Legal & Notary Officer', department: 'Legal', status: 'Active', hireDate: '2023-02-15', salary: 15000000, performanceScore: 4.0 },
  { id: 'EMP-005', name: 'Putri Handayani, S.Psi.', role: 'HR Manager', department: 'HRD', status: 'Active', hireDate: '2022-01-01', salary: 18000000, performanceScore: 4.4 }
];

export const initialDocuments: DocumentHub[] = [
  {
    id: 'DOC-01',
    title: 'Surat Perjanjian Kerja Sama Subkontraktor Pondasi',
    category: 'Contract',
    version: '1.2',
    uploadedBy: 'Rian Hidayat, S.H.',
    uploadedDate: '2026-06-15',
    status: 'Review',
    approvalWorkflow: [
      { step: 'Legal Review', approverRole: 'Legal Officer', approverName: 'Rian Hidayat, S.H.', approved: true, approvedAt: '2026-06-15T09:00:00Z' },
      { step: 'Project Mgr Sign', approverRole: 'Project Manager', approverName: 'Ir. Ahmad Fauzi', approved: true, approvedAt: '2026-06-16T14:30:00Z' },
      { step: 'Owner Sign-Off', approverRole: 'Chief Executive Officer', approverName: 'Bapak Direktur Utama', approved: false }
    ]
  },
  {
    id: 'DOC-02',
    title: 'Standard Operating Procedure (SOP) Serah Terima Unit (Handover)',
    category: 'SOP',
    version: '2.0',
    uploadedBy: 'Putri Handayani',
    uploadedDate: '2026-05-10',
    status: 'Approved',
    approvalWorkflow: [
      { step: 'HR Coordinator', approverRole: 'HR Manager', approverName: 'Putri Handayani', approved: true, approvedAt: '2026-05-10T10:00:00Z' },
      { step: 'CFO Sign-Off', approverRole: 'Chief Financial Officer', approverName: 'Hendra Setiawan', approved: true, approvedAt: '2026-05-11T16:00:00Z' }
    ]
  },
  {
    id: 'DOC-03',
    title: 'Rencana Anggaran Biaya (RAB) Menteng Heights v2',
    category: 'Finance',
    version: '2.1',
    uploadedBy: 'Hendra Setiawan',
    uploadedDate: '2026-06-01',
    status: 'Approved',
    approvalWorkflow: [
      { step: 'Finance Mgr Sign', approverRole: 'Chief Financial Officer', approverName: 'Hendra Setiawan', approved: true, approvedAt: '2026-06-01T08:00:00Z' },
      { step: 'Owner Approval', approverRole: 'Chief Executive Officer', approverName: 'Bapak Direktur', approved: true, approvedAt: '2026-06-02T11:00:00Z' }
    ]
  }
];

export const initialSOPs: SOPItem[] = [
  {
    id: 'SOP-01',
    code: 'SOP-FIN-01',
    title: 'Prosedur Verifikasi Booking Fee & Pembayaran Down Payment',
    department: 'Finance',
    steps: [
      'Customer menyerahkan bukti transfer booking fee.',
      'Staff Keuangan memverifikasi dana masuk di rekening bank perusahaan.',
      'Cetak Kuitansi Resmi bertanda tangan CFO dan cetak Surat Pesanan Unit (SPU).',
      'Input data transaksi SPU di DeveloperPro ERP untuk mengunci status unit perumahan.',
      'Mengingatkan customer mengenai pembayaran Down Payment termin 1 maksimal 14 hari setelah booking.'
    ],
    lastUpdated: '2026-01-15'
  },
  {
    id: 'SOP-02',
    code: 'SOP-PROJ-03',
    title: 'Prosedur Quality Control Cor Beton Struktur Utama',
    department: 'Project',
    steps: [
      'Melakukan slump test di lokasi pengecoran untuk mengukur kekentalan adukan beton.',
      'Mengambil sampel silinder beton (minimal 3 buah per 50 m3 cor) untuk tes kuat tekan laboratorium.',
      'Memastikan pemasangan bekisting presisi, kokoh, dan dibersihkan dari kotoran sebelum dituang.',
      'Gunakan vibrator secara merata pada saat penuangan agar tidak ada rongga udara/sarang tawon.',
      'Lakukan curing (perawatan beton) dengan penyiraman air berkala selama minimal 7 hari pasca-cor.'
    ],
    lastUpdated: '2025-08-20'
  }
];

export const initialForms: FormItem[] = [
  { id: 'FRM-01', name: 'Formulir SPU (Surat Pesanan Unit)', category: 'Sales', downloadUrl: '#' },
  { id: 'FRM-02', name: 'Surat Permohonan KPR (Bank Mandiri & BCA)', category: 'Finance', downloadUrl: '#' },
  { id: 'FRM-03', name: 'Formulir Checklist Handover Serah Terima Kunci', category: 'Project', downloadUrl: '#' },
  { id: 'FRM-04', name: 'Formulir Pengajuan Cuti Karyawan', category: 'HRD', downloadUrl: '#' }
];

export const initialAuditLogs: AuditLog[] = [
  { id: 'AUD-001', timestamp: '2026-06-27T10:15:30Z', user: 'Hendra Setiawan', action: 'SALES_CREATE', details: 'Mencatat prospek booking baru: unit A-12A oleh customer Irwan Setiawan' },
  { id: 'AUD-002', timestamp: '2026-06-27T11:02:10Z', user: 'Ir. Ahmad Fauzi', action: 'PROJECT_UPDATE', details: 'Memperbarui kemajuan Milestone Struktur Basement menjadi 100%' },
  { id: 'AUD-003', timestamp: '2026-06-27T11:30:15Z', user: 'Rian Hidayat', action: 'DOCUMENT_APPROVE', details: 'Menandatangani dokumen DOC-01 step: Legal Review' }
];
