export type UserRole = 'ADMIN' | 'FINANCE' | 'PROJECT_MANAGER' | 'MARKETING' | 'HRD';

export interface LandAcquisition {
  id: string;
  location: string;
  areaSqm: number;
  pricePerMeter: number;
  totalPrice: number;
  ownerName: string;
  status: 'Negotiation' | 'Deal' | 'DP_Paid' | 'Fully_Paid' | 'Legal_Process';
  notaryName: string;
  shmNumber: string;
  notes: string;
}

export interface LegalDocument {
  id: string;
  name: string;
  category: 'Izin_Prinsip' | 'PBG' | 'AMD_SOP' | 'Sertifikat_Induk' | 'PBB';
  issuedDate: string;
  expiryDate: string;
  issuer: string;
  status: 'Pending' | 'In_Progress' | 'Approved' | 'Expired';
}

export interface ProjectMilestone {
  id: string;
  name: string;
  weightPercentage: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  progressPercentage: number;
  contractorName: string;
  status: 'Not_Started' | 'In_Progress' | 'Completed' | 'Delayed';
}

export interface ConstructionLog {
  id: string;
  date: string;
  weather: 'Sunny' | 'Rainy' | 'Cloudy';
  laborCount: number;
  materialsDelivered: string;
  activities: string;
  issues: string;
  reporter: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  landAcquisitions: LandAcquisition[];
  legalDocuments: LegalDocument[];
  milestones: ProjectMilestone[];
  constructionLogs: ConstructionLog[];
  totalBudget: number;
}

export interface Sales {
  id: string;
  customerName: string;
  nik: string;
  kkNumber: string;
  address: string;
  phoneNumber: string;
  projectName: string;
  unitCode: string;
  bookingFee: number;
  bookingDate: string;
  paymentMethod: 'KPR' | 'Cash Bertahap' | 'Cash Keras';
  dpAmount: number;
  totalPrice: number;
  status: 'Booking' | 'DP_Paid' | 'SPU' | 'Pemberkasan' | 'Akad' | 'Handover';
  marketingCommission: number;
  salesCommission: number;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  channel: 'Instagram Ads' | 'Facebook Ads' | 'TikTok Ads' | 'Billboards' | 'Property Expo';
  budget: number;
  leadsAcquired: number;
  conversions: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'Planned';
}

export interface CSComplaint {
  id: string;
  customerName: string;
  unitCode: string;
  issueType: 'Struktur Retak' | 'Kebocoran Atap' | 'Kelistrikan' | 'Fasilitas Umum' | 'Lainnya';
  description: string;
  reportedDate: string;
  status: 'New' | 'Investigating' | 'Repair_In_Progress' | 'Resolved';
  resolutionDetails?: string;
}

export interface HRDEmployee {
  id: string;
  name: string;
  role: string;
  department: 'Finance' | 'Project' | 'Marketing' | 'HRD' | 'Legal';
  status: 'Active' | 'On_Leave' | 'Resigned';
  hireDate: string;
  salary: number;
  performanceScore: number; // 1 to 5
}

export interface DocumentHub {
  id: string;
  title: string;
  category: 'Contract' | 'SOP' | 'Legal' | 'Finance';
  version: string;
  uploadedBy: string;
  uploadedDate: string;
  status: 'Draft' | 'Review' | 'Approved';
  approvalWorkflow: {
    step: string;
    approverRole: string;
    approverName: string;
    approved: boolean;
    approvedAt?: string;
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface SOPItem {
  id: string;
  code: string;
  title: string;
  department: 'Finance' | 'Project' | 'Marketing' | 'HRD' | 'Legal';
  steps: string[];
  lastUpdated: string;
}

export interface FormItem {
  id: string;
  name: string;
  category: string;
  downloadUrl: string;
}

export interface WhatsAppLog {
  id: string;
  timestamp: string;
  phone: string;
  recipientName: string;
  role: string;
  message: string;
  type: 'Procurement PO' | 'Document Approval' | 'Project Milestone' | 'Manual';
  status: 'Sent' | 'Delivered' | 'Read' | 'Failed';
}
