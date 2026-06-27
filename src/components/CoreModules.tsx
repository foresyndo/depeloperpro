import { useState } from 'react';
import { 
  MarketingCampaign, CSComplaint, HRDEmployee, DocumentHub, SOPItem, FormItem, AuditLog, WhatsAppLog 
} from '../types';
import { formatRupiah, generateQRUrl } from '../utils/helpers';
import { STAKEHOLDER_DIRECTORY, buildProcurementPOTemplate, buildDocumentStepApprovedTemplate, buildProjectMilestoneTemplate, sendWhatsAppNotification } from '../utils/whatsapp';
import { 
  Users, AlertCircle, Briefcase, FileSignature, BookOpen, Download, 
  Terminal, Settings, Send, CheckCircle2, RefreshCw, Plus, ShieldAlert, Camera
} from 'lucide-react';
import QRScannerModal from './QRScannerModal';

interface CoreModulesProps {
  campaigns: MarketingCampaign[];
  complaints: CSComplaint[];
  employees: HRDEmployee[];
  docs: DocumentHub[];
  sops: SOPItem[];
  forms: FormItem[];
  auditLogs: AuditLog[];
  whatsappLogs: WhatsAppLog[];
  onAddCampaign: (c: MarketingCampaign) => void;
  onAddComplaint: (c: CSComplaint) => void;
  onAddEmployee: (e: HRDEmployee) => void;
  onApproveDocumentStep: (docId: string, stepName: string) => void;
  onAddWhatsAppLog: (log: WhatsAppLog) => void;
  addAuditLog: (action: string, details: string) => void;
}

export default function CoreModules({
  campaigns,
  complaints,
  employees,
  docs,
  sops,
  forms,
  auditLogs,
  whatsappLogs,
  onAddCampaign,
  onAddComplaint,
  onAddEmployee,
  onApproveDocumentStep,
  onAddWhatsAppLog,
  addAuditLog
}: CoreModulesProps) {
  
  const [activeTab, setActiveTab] = useState<'crm' | 'cs' | 'hr' | 'docs' | 'whatsapp' | 'sop' | 'audit'>('crm');
  
  // ----------------------------------------------------
  // MARKETING CRM STATE & SUBMIT
  // ----------------------------------------------------
  const [newCamp, setNewCamp] = useState({
    name: '',
    channel: 'Instagram Ads' as MarketingCampaign['channel'],
    budget: '',
    startDate: '',
    endDate: '',
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamp.name || !newCamp.budget) return;
    const c: MarketingCampaign = {
      id: `CMP-${Math.floor(100 + Math.random() * 900)}`,
      name: newCamp.name,
      channel: newCamp.channel,
      budget: Number(newCamp.budget),
      leadsAcquired: 0,
      conversions: 0,
      startDate: newCamp.startDate || new Date().toISOString().split('T')[0],
      endDate: newCamp.endDate || new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    onAddCampaign(c);
    addAuditLog('CAMPAIGN_CREATE', `Membuat kampanye pemasaran baru: ${c.name} via ${c.channel}`);
    setNewCamp({ name: '', channel: 'Instagram Ads', budget: '', startDate: '', endDate: '' });
  };

  // ----------------------------------------------------
  // CUSTOMER SERVICE COMPLAINTS
  // ----------------------------------------------------
  const [newComplaint, setNewComplaint] = useState({
    customerName: '',
    unitCode: '',
    issueType: 'Struktur Retak' as CSComplaint['issueType'],
    description: '',
  });

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaint.customerName || !newComplaint.unitCode || !newComplaint.description) return;
    const c: CSComplaint = {
      id: `CMPL-${Math.floor(100 + Math.random() * 900)}`,
      customerName: newComplaint.customerName,
      unitCode: newComplaint.unitCode,
      issueType: newComplaint.issueType,
      description: newComplaint.description,
      reportedDate: new Date().toISOString().split('T')[0],
      status: 'New'
    };
    onAddComplaint(c);
    addAuditLog('CS_COMPLAINT_CREATE', `Menerima pengaduan komplain baru unit ${c.unitCode} oleh ${c.customerName}`);
    setNewComplaint({ customerName: '', unitCode: '', issueType: 'Struktur Retak', description: '' });
  };

  // ----------------------------------------------------
  // HRD & PERSONNEL STATE
  // ----------------------------------------------------
  const [newEmp, setNewEmp] = useState({
    name: '',
    role: '',
    department: 'Marketing' as HRDEmployee['department'],
    salary: '',
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.role || !newEmp.salary) return;
    const item: HRDEmployee = {
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: newEmp.name,
      role: newEmp.role,
      department: newEmp.department,
      status: 'Active',
      hireDate: new Date().toISOString().split('T')[0],
      salary: Number(newEmp.salary),
      performanceScore: 4.0
    };
    onAddEmployee(item);
    addAuditLog('HR_EMPLOYEE_CREATE', `Merekrut karyawan baru: ${item.name} sebagai ${item.role}`);
    setNewEmp({ name: '', role: '', department: 'Marketing', salary: '' });
  };

  // ----------------------------------------------------
  // DOCUMENT HUB & QR ESIGN SIMULATOR
  // ----------------------------------------------------
  const [selectedQRDocId, setSelectedQRDocId] = useState<string | null>(null);
  const [simulatedScanStatus, setSimulatedScanStatus] = useState<'idle' | 'scanning' | 'verified' | 'error'>('idle');
  const [scannedDocData, setScannedDocData] = useState<DocumentHub | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const handleOpenQRModal = (docId: string) => {
    setSelectedQRDocId(docId);
    setSimulatedScanStatus('idle');
    setScannedDocData(null);
  };

  const handleSimulateScan = () => {
    if (!selectedQRDocId) return;
    setSimulatedScanStatus('scanning');
    
    setTimeout(() => {
      const doc = docs.find(d => d.id === selectedQRDocId);
      if (doc) {
        setScannedDocData(doc);
        setSimulatedScanStatus('verified');
        addAuditLog('E_SIGNATURE_QR_VERIFY', `Memverifikasi integritas dokumen ${doc.title} via QR scanner`);
      } else {
        setSimulatedScanStatus('error');
      }
    }, 1200);
  };

  // ----------------------------------------------------
  // WHATSAPP GATEWAY DISPATCH STATE
  // ----------------------------------------------------
  const [waConfig] = useState({
    gatewayUrl: 'https://api.whatsapp-gateway.id/v1',
    apiKey: 'DEV_SECRET_TOKEN_49102X',
    senderNumber: '081299887766'
  });

  const [selectedStakeholderId, setSelectedStakeholderId] = useState(STAKEHOLDER_DIRECTORY[0]?.id || '');
  const [waCategory, setWaCategory] = useState<'Procurement PO' | 'Document Approval' | 'Project Milestone' | 'Manual'>('Procurement PO');
  
  // Fields for templates
  const [poFields, setPoFields] = useState({ poNumber: 'PO-2026-102A', totalValue: 'Rp 450.000.000', jobDesc: 'Pengecoran Balok Struktur Lantai 3' });
  const [docFields, setDocFields] = useState({ docTitle: 'Pernyataan Batas Tanah SHM 892', docVersion: '1.2', stepName: 'Legal Review', approverName: 'Rian Hidayat, S.H.', nextStatus: 'APPROVED' });
  const [milestoneFields, setMilestoneFields] = useState({ milestoneName: 'Pekerjaan Pondasi Pancang (Piling)', projectName: 'Menteng Heights Residence', planEnd: '2026-03-15', actEnd: '2026-03-20' });
  const [manualMessage, setManualMessage] = useState('');

  const [isSendingWA, setIsSendingWA] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{ success: boolean; text?: string } | null>(null);

  // Auto compile current message draft
  const getCompiledMessage = () => {
    const stakeholder = STAKEHOLDER_DIRECTORY.find(s => s.id === selectedStakeholderId);
    if (!stakeholder) return '';

    if (waCategory === 'Procurement PO') {
      return buildProcurementPOTemplate(stakeholder.name, stakeholder.company, poFields.poNumber, poFields.totalValue, poFields.jobDesc);
    }
    if (waCategory === 'Document Approval') {
      return buildDocumentStepApprovedTemplate(docFields.docTitle, docFields.docVersion, docFields.stepName, docFields.approverName, docFields.nextStatus);
    }
    if (waCategory === 'Project Milestone') {
      return buildProjectMilestoneTemplate(milestoneFields.milestoneName, milestoneFields.projectName, milestoneFields.planEnd, milestoneFields.actEnd);
    }
    return manualMessage;
  };

  const handleSendWhatsApp = async () => {
    const stakeholder = STAKEHOLDER_DIRECTORY.find(s => s.id === selectedStakeholderId);
    if (!stakeholder) return;

    setIsSendingWA(true);
    setDispatchResult(null);

    const messageContent = getCompiledMessage();

    try {
      const res = await sendWhatsAppNotification(
        stakeholder.phone,
        stakeholder.name,
        stakeholder.role,
        messageContent,
        waCategory
      );

      if (res.success && res.log) {
        onAddWhatsAppLog(res.log);
        setDispatchResult({ success: true, text: `Pesan WhatsApp berhasil dikirim ke ${stakeholder.name} (${stakeholder.phone})` });
        addAuditLog('WHATSAPP_DISPATCH', `Mengirim pesan gateway ${waCategory} ke ${stakeholder.name}`);
        if (waCategory === 'Manual') setManualMessage('');
      } else {
        setDispatchResult({ success: false, text: res.error || 'Gagal mengirim pesan via server gateway.' });
      }
    } catch (err: any) {
      setDispatchResult({ success: false, text: err.message || 'Terjadi kesalahan jaringan' });
    } finally {
      setIsSendingWA(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Subsystems Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('crm')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'crm' ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Users className="h-4 w-4" />
          Marketing CRM
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cs')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'cs' ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          Layanan CS
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hr')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'hr' ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          HRD Kepegawaian
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('docs')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'docs' ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <FileSignature className="h-4 w-4" />
          Doc Hub & E-Sign
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('whatsapp')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'whatsapp' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:bg-emerald-50 dark:hover:bg-slate-900'
          }`}
        >
          <Send className="h-4 w-4" />
          WhatsApp Gateway
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sop')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'sop' ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          SOP & Form Center
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'audit' ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Terminal className="h-4 w-4" />
          Audit Trail Logs
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODULE 1: MARKETING CRM */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'crm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2.5">Mulai Kampanye Promo</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Kampanye / Promo</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cashback DP Cluster A"
                  value={newCamp.name}
                  onChange={e => setNewCamp(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Saluran Iklan</label>
                <select
                  value={newCamp.channel}
                  onChange={e => setNewCamp(prev => ({ ...prev, channel: e.target.value as any }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200"
                >
                  <option value="Instagram Ads">Instagram Ads</option>
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="TikTok Ads">TikTok Ads</option>
                  <option value="Billboards">Billboards</option>
                  <option value="Property Expo">Property Expo</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Anggaran Promosi (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 15000000"
                  value={newCamp.budget}
                  onChange={e => setNewCamp(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Publikasikan Kampanye
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[9px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="p-3">Nama Kampanye</th>
                    <th className="p-3">Media Promosi</th>
                    <th className="p-3 text-right">Anggaran (Rp)</th>
                    <th className="p-3 text-right">Leads Acquired</th>
                    <th className="p-3 text-right">Konversi Closing</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {campaigns.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.startDate} s.d {item.endDate}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-500 uppercase text-[9px]">{item.channel}</td>
                      <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">{formatRupiah(item.budget)}</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-600">{item.leadsAcquired}</td>
                      <td className="p-3 text-right font-mono font-black text-emerald-600">{item.conversions}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          item.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODULE 2: CUSTOMER SERVICE */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'cs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2.5">Input Keluhan Unit</h3>
            <form onSubmit={handleCreateComplaint} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Pemilik Unit</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ferry Salim"
                  value={newComplaint.customerName}
                  onChange={e => setNewComplaint(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kode Unit Kavling</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S-40"
                    value={newComplaint.unitCode}
                    onChange={e => setNewComplaint(prev => ({ ...prev, unitCode: e.target.value }))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kategori Masalah</label>
                  <select
                    value={newComplaint.issueType}
                    onChange={e => setNewComplaint(prev => ({ ...prev, issueType: e.target.value as any }))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200"
                  >
                    <option value="Struktur Retak">Struktur Retak</option>
                    <option value="Kebocoran Atap">Kebocoran Atap</option>
                    <option value="Kelistrikan">Kelistrikan</option>
                    <option value="Fasilitas Umum">Fasilitas Umum</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Deskripsi Kerusakan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Rincian kerusakan properti atau kendala..."
                  value={newComplaint.description}
                  onChange={e => setNewComplaint(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Kirim Laporan Komplain
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[9px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="p-3">Customer & Unit</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Deskripsi Keluhan</th>
                    <th className="p-3">Tgl Lapor</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {complaints.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{item.customerName}</div>
                        <div className="text-[10px] font-bold text-emerald-600">Unit {item.unitCode}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-500 text-[10px]">{item.issueType}</td>
                      <td className="p-3">
                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-xs truncate" title={item.description}>{item.description}</p>
                        {item.resolutionDetails && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold italic mt-0.5">Solusi: {item.resolutionDetails}</p>}
                      </td>
                      <td className="p-3 font-mono text-slate-500">{item.reportedDate}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          item.status === 'Resolved' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' 
                            : item.status === 'New'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-450'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODULE 3: HRD KEPEGAWAIAN */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'hr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2.5">Input Karyawan Baru</h3>
            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Putri Handayani, S.Psi."
                  value={newEmp.name}
                  onChange={e => setNewEmp(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Jabatan / Peran</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HR Staff"
                    value={newEmp.role}
                    onChange={e => setNewEmp(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Divisi / Dep</label>
                  <select
                    value={newEmp.department}
                    onChange={e => setNewEmp(prev => ({ ...prev, department: e.target.value as any }))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Project">Project</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HRD">HRD</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gaji Pokok Bulanan (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 12000000"
                  value={newEmp.salary}
                  onChange={e => setNewEmp(prev => ({ ...prev, salary: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Daftarkan Karyawan
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[9px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="p-3">Nama Karyawan</th>
                    <th className="p-3">Jabatan & Divisi</th>
                    <th className="p-3 text-right">Gaji Bulanan</th>
                    <th className="p-3 text-right">Performance Score</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {employees.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">{item.role}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Dept: {item.department}</div>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-750 dark:text-slate-300 font-mono">{formatRupiah(item.salary)}</td>
                      <td className="p-3 text-right">
                        <span className="font-bold font-mono text-emerald-600">{item.performanceScore.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-450"> / 5.0</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-[9px] font-bold rounded">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODULE 4: DOCUMENT HUB & QR E-SIGN */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3 flex-1">
              <FileSignature className="h-5 w-5 text-blue-600 shrink-0" />
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                <strong>E-Signature Integrity:</strong> Sistem ERP menyematkan penanda hash kriptografi ke dalam dokumen persetujuan kerja sama. Klik <strong>E-Signature Validasi QR</strong> untuk melihat QR dokumen atau klik tombol kamera untuk memindai berkas cetak fisik secara langsung.
              </p>
            </div>
            <button
              type="button"
              id="camera-qr-scanner-main-btn"
              onClick={() => setIsQRScannerOpen(true)}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              Pindai QR Berkas Fisik
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {docs.map(doc => (
              <div key={doc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-blue-500 transition-all">
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded">
                      {doc.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">v{doc.version}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100 leading-snug">{doc.title}</h4>
                  <p className="text-[10px] text-slate-450">Diupload oleh {doc.uploadedBy} pada {doc.uploadedDate}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-50 dark:border-slate-850">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">Workflow Persetujuan</span>
                  
                  <div className="space-y-2 text-[10px] font-semibold">
                    {doc.approvalWorkflow.map((step, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2">
                        <span className="text-slate-600 dark:text-slate-400 truncate">{step.step}</span>
                        {step.approved ? (
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">APPROVED</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onApproveDocumentStep(doc.id, step.step);
                              addAuditLog('DOCUMENT_APPROVE', `Menyetujui alur e-signature ${step.step} untuk dokumen ${doc.title}`);
                            }}
                            className="text-[9px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 transition cursor-pointer"
                          >
                            Setujui
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-50 dark:border-slate-850 flex items-center justify-between">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                    doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Status: {doc.status}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => handleOpenQRModal(doc.id)}
                    className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    E-Signature Validasi QR
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODULE 5: WHATSAPP GATEWAY DISPATCHER */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Dispatch controls */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-500 text-white rounded-xl">
                  <Send className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">WhatsApp Broadcast Control</h3>
                  <p className="text-[10px] text-slate-400">Konfigurasi Gateway & Pengiriman Notifikasi Lapangan</p>
                </div>
              </div>
            </div>

            {/* Gateway settings banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-semibold text-slate-500">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">API GATEWAY</span>
                <span className="text-slate-700 dark:text-slate-300 truncate block">{waConfig.gatewayUrl}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">SENDER NUMBER</span>
                <span className="text-slate-700 dark:text-slate-300 block">{waConfig.senderNumber}</span>
              </div>
              <div className="text-right flex items-center justify-end">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 text-[9px] font-black rounded uppercase tracking-wider">CONNECTED</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Select Recipient */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Pilih Stakeholder Penerima</label>
                <select
                  value={selectedStakeholderId}
                  onChange={e => setSelectedStakeholderId(e.target.value)}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-200"
                >
                  {STAKEHOLDER_DIRECTORY.map(stk => (
                    <option key={stk.id} value={stk.id}>
                      {stk.name} - {stk.role} ({stk.company}) • {stk.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Category */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Pilih Kategori Pesan / Template</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
                  {(['Procurement PO', 'Document Approval', 'Project Milestone', 'Manual'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setWaCategory(cat);
                        setDispatchResult(null);
                      }}
                      className={`py-1.5 rounded text-[10px] font-bold transition cursor-pointer ${
                        waCategory === cat 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category-specific Parameters */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
                <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-1">
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  Atur Parameter Template: {waCategory}
                </h4>

                {waCategory === 'Procurement PO' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Nomor PO</label>
                      <input
                        type="text"
                        value={poFields.poNumber}
                        onChange={e => setPoFields(prev => ({ ...prev, poNumber: e.target.value }))}
                        className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Nilai Kontrak (Rp)</label>
                      <input
                        type="text"
                        value={poFields.totalValue}
                        onChange={e => setPoFields(prev => ({ ...prev, totalValue: e.target.value }))}
                        className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Uraian Pekerjaan</label>
                      <input
                        type="text"
                        value={poFields.jobDesc}
                        onChange={e => setPoFields(prev => ({ ...prev, jobDesc: e.target.value }))}
                        className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                      />
                    </div>
                  </div>
                )}

                {waCategory === 'Document Approval' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Nama Dokumen</label>
                      <input
                        type="text"
                        value={docFields.docTitle}
                        onChange={e => setDocFields(prev => ({ ...prev, docTitle: e.target.value }))}
                        className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Nama Approver</label>
                      <input
                        type="text"
                        value={docFields.approverName}
                        onChange={e => setDocFields(prev => ({ ...prev, approverName: e.target.value }))}
                        className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Status E-Signature</label>
                      <input
                        type="text"
                        value={docFields.nextStatus}
                        onChange={e => setDocFields(prev => ({ ...prev, nextStatus: e.target.value }))}
                        className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-black uppercase"
                      />
                    </div>
                  </div>
                )}

                {waCategory === 'Project Milestone' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Nama Pekerjaan Lapangan (Milestone)</label>
                      <input
                        type="text"
                        value={milestoneFields.milestoneName}
                        onChange={e => setMilestoneFields(prev => ({ ...prev, milestoneName: e.target.value }))}
                        className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Proyek Lokasi</label>
                      <input
                        type="text"
                        value={milestoneFields.projectName}
                        onChange={e => setMilestoneFields(prev => ({ ...prev, projectName: e.target.value }))}
                        className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold"
                      />
                    </div>
                  </div>
                )}

                {waCategory === 'Manual' && (
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Isi Pesan Bebas (Gunakan format *tebal* atau _miring_)</label>
                    <textarea
                      rows={3}
                      value={manualMessage}
                      onChange={e => setManualMessage(e.target.value)}
                      placeholder="Ketik pesan khusus untuk stakeholder di sini..."
                      className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                    />
                  </div>
                )}
              </div>

              {/* Message Draft Preview */}
              <div>
                <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block mb-1.5">Draft Review Konten Pesan</label>
                <div className="p-4 bg-emerald-50/50 dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 rounded-xl font-mono text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed text-[11px] select-all">
                  {getCompiledMessage()}
                </div>
              </div>

              {/* Dispatch Action */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSendingWA}
                  onClick={handleSendWhatsApp}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSendingWA ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Sedang Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Kirim Notifikasi Real-Time
                    </>
                  )}
                </button>
              </div>

              {/* Dispatch feedback result */}
              {dispatchResult && (
                <div className={`p-3 rounded-lg border text-xs font-semibold flex items-start gap-2 ${
                  dispatchResult.success 
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-400' 
                    : 'bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-400'
                }`}>
                  {dispatchResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />}
                  <span>{dispatchResult.text}</span>
                </div>
              )}

            </div>
          </div>

          {/* WhatsApp Audit Dispatch Logs panel */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-slate-500" />
                  WA Gateway Dispatch Logs
                </h3>
                <span className="text-[10px] font-bold text-slate-400 font-mono">LIVE FEED</span>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
                {whatsappLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg text-[11px] space-y-2 leading-relaxed">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">
                      <span className="text-slate-600 dark:text-slate-350">{log.recipientName} ({log.role})</span>
                      <span className="font-mono">{log.timestamp.slice(11, 19)}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 italic font-medium">"{log.message.slice(0, 100)}..."</p>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                      <span className="text-emerald-600">{log.type}</span>
                      <span className="text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full font-bold">✓ {log.status}</span>
                    </div>
                  </div>
                ))}
                {whatsappLogs.length === 0 && (
                  <p className="text-xs text-slate-400 py-12 text-center font-bold">Belum ada transmisi pesan keluar.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono italic text-center">
              *Notifikasi diarahkan via gateway Cloud Run.
            </div>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODULE 6: SOPS & FORMS CENTER */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'sop' && (
        <div className="space-y-6">
          
          {/* SOPs Checklists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sops.map(sop => (
              <div key={sop.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-start gap-4">
                  <div>
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-black text-[9px] text-slate-500">{sop.code}</span>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-snug mt-1">{sop.title}</h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">Updated: {sop.lastUpdated}</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tahap Kendali Mutu SOP ({sop.department})</span>
                  {sop.steps.map((step, idx) => (
                    <label key={idx} className="flex items-start gap-2.5 p-2 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-850 hover:bg-slate-100/50 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input 
                        type="checkbox" 
                        defaultChecked={idx < 2} // Pre-fill first couple steps
                        className="mt-0.5 accent-emerald-600 h-3.5 w-3.5 shrink-0" 
                      />
                      <span>{step}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Form center blank templates */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              Blanko Resmi Perusahaan (Unduh PDF Templates)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {forms.map(form => (
                <div key={form.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-between gap-3 hover:border-emerald-500 transition">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{form.name}</p>
                    <p className="text-[9px] font-black uppercase text-slate-450">{form.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Mengunduh berkas template: ${form.name}.pdf`);
                      addAuditLog('FORM_DOWNLOAD', `Mengunduh blanko formulir ${form.name}`);
                    }}
                    className="p-1.5 bg-white dark:bg-slate-800 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 rounded-lg transition shrink-0 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODULE 7: AUDIT TRAIL LOGS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Log Riwayat Audit Keamanan Sistem</h3>
          </div>

          <div className="p-4">
            <div className="font-mono text-[11px] bg-slate-950 text-slate-300 p-4 rounded-xl border border-slate-800 space-y-2 h-[450px] overflow-y-auto">
              <p className="text-slate-500">// INTEGRITY CHECK: SECURITY KEY VALIDATED // SYSTEM OK</p>
              {auditLogs.map(log => (
                <div key={log.id} className="hover:text-white transition flex flex-col sm:flex-row gap-2 sm:gap-6 border-b border-slate-900 pb-2">
                  <span className="text-emerald-500 font-bold shrink-0">[{log.timestamp.replace('T', ' ').slice(0, 19)}]</span>
                  <span className="text-blue-400 font-black shrink-0">{log.action}</span>
                  <p className="text-slate-300"><strong className="text-slate-100">{log.user}:</strong> {log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DOCUMENT E-SIGNATURE VERIFICATION QR SCROLL MODAL */}
      {/* ---------------------------------------------------- */}
      {selectedQRDocId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl animate-slide-up p-6 space-y-6">
            
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">E-Signature Verifikasi QR</h3>
                <p className="text-[10px] text-slate-450">Pindai kode QR untuk validasi hukum berkas</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQRDocId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              
              {/* QR Code Container */}
              <div className="p-4 bg-white border border-slate-200 dark:border-slate-700 rounded-2xl shadow">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRUrl(selectedQRDocId))}`}
                  alt="E-Signature QR Verification Link"
                  className="h-36 w-36"
                />
              </div>

              <div className="text-xs max-w-xs space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-350">
                  {docs.find(d => d.id === selectedQRDocId)?.title}
                </p>
                <p className="text-[10px] text-slate-400">Verifikasi Hash Sidik Jari Kriptografi Terpasang</p>
              </div>

              {/* QR scan simulator controls */}
              <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                
                {simulatedScanStatus === 'idle' && (
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      type="button"
                      onClick={handleSimulateScan}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Simulasikan Pemindaian Lapangan (MOCK)
                    </button>
                    <button
                      type="button"
                      id="open-real-cam-from-doc-modal"
                      onClick={() => {
                        setSelectedQRDocId(null); // Close this mock modal first
                        setIsQRScannerOpen(true); // Open the real camera scanner modal
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="h-4 w-4" />
                      Pindai Langsung via Kamera Real-Time
                    </button>
                  </div>
                )}

                {simulatedScanStatus === 'scanning' && (
                  <div className="py-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs font-bold text-blue-600 animate-pulse flex items-center justify-center gap-2 border border-blue-250">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Memeriksa Integritas Tanda Tangan Kriptografi...
                  </div>
                )}

                {simulatedScanStatus === 'verified' && scannedDocData && (
                  <div className="p-4 bg-emerald-50 dark:bg-slate-950 border border-emerald-300 dark:border-emerald-800 rounded-xl text-left space-y-2 text-xs leading-normal animate-fade-in">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold border-b border-emerald-100 dark:border-slate-800 pb-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      HASIL DEKRIPSI QR: VALID ✓
                    </div>
                    
                    <div className="space-y-1 font-semibold text-slate-600 dark:text-slate-350">
                      <p>• Judul: <span className="text-slate-800 dark:text-slate-200">{scannedDocData.title}</span></p>
                      <p>• Versi: <span className="text-slate-850 dark:text-slate-200">v{scannedDocData.version}</span></p>
                      <p>• Penandatangan Resmi yang Sah:</p>
                      <div className="pl-3 space-y-0.5 text-[11px] font-bold text-slate-500">
                        {scannedDocData.approvalWorkflow.map((step, sIdx) => (
                          <div key={sIdx}>
                            ✓ {step.approverName} ({step.approverRole}) - APPROVED
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

            <button
              type="button"
              onClick={() => setSelectedQRDocId(null)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Selesai Validasi
            </button>

          </div>
        </div>
      )}

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        docs={docs}
        onVerified={(doc) => {
          addAuditLog('E_SIGNATURE_QR_VERIFY', `Memverifikasi keaslian dokumen ${doc.title} (ID: ${doc.id}) menggunakan kamera pemindai QR fisik`);
        }}
      />

    </div>
  );
}
