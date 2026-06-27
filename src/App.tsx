import { useState, useEffect } from 'react';
import { 
  Project, Sales, MarketingCampaign, CSComplaint, HRDEmployee, DocumentHub, SOPItem, FormItem, AuditLog, WhatsAppLog, LandAcquisition, ConstructionLog 
} from './types';
import { 
  initialProjects, initialSales, initialCampaigns, initialCSComplaints, initialEmployees, initialDocuments, initialSOPs, initialForms, initialAuditLogs 
} from './data/mockData';
import Dashboard from './components/Dashboard';
import FinanceModule from './components/FinanceModule';
import ProjectModule from './components/ProjectModule';
import AICalculator from './components/AICalculator';
import CoreModules from './components/CoreModules';
import { 
  Building2, Landmark, DollarSign, Brain, HardHat, ShieldCheck, Sun, Moon, 
  Menu, X, Activity 
} from 'lucide-react';

export default function App() {
  // Global States
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [salesList, setSalesList] = useState<Sales[]>(initialSales);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(initialCampaigns);
  const [complaints, setComplaints] = useState<CSComplaint[]>(initialCSComplaints);
  const [employees, setEmployees] = useState<HRDEmployee[]>(initialEmployees);
  const [docs, setDocs] = useState<DocumentHub[]>(initialDocuments);
  const [sops] = useState<SOPItem[]>(initialSOPs);
  const [forms] = useState<FormItem[]>(initialForms);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLog[]>([]);

  // Navigation tab states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'finance' | 'project' | 'ai-calc' | 'core'>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<string>('');

  // UI Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load WhatsApp logs from server on mount
  useEffect(() => {
    const fetchWhatsAppLogs = async () => {
      try {
        const res = await fetch('/api/whatsapp/logs');
        if (res.ok) {
          const data = await res.json();
          setWhatsappLogs(data.logs || []);
        }
      } catch (err) {
        console.error('Failed to load WhatsApp logs:', err);
      }
    };
    fetchWhatsAppLogs();
  }, []);

  // Helper to add audit logs
  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `AUD-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      user: 'Super Admin',
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // State handlers passed to modules
  const handleAddSales = (newSales: Sales) => {
    setSalesList(prev => [newSales, ...prev]);
  };

  const handleUpdateSalesStatus = (salesId: string, status: Sales['status']) => {
    setSalesList(prev => prev.map(s => s.id === salesId ? { ...s, status } : s));
  };

  const handleAddLandAcquisition = (projectId: string, land: LandAcquisition) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, landAcquisitions: [land, ...p.landAcquisitions] };
      }
      return p;
    }));
  };

  const handleUpdateMilestone = (projectId: string, milestoneId: string, progress: number, status: any) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          milestones: p.milestones.map(m => m.id === milestoneId ? { ...m, progressPercentage: progress, status } : m)
        };
      }
      return p;
    }));
  };

  const handleAddConstructionLog = (projectId: string, log: ConstructionLog) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, constructionLogs: [log, ...p.constructionLogs] };
      }
      return p;
    }));
  };

  const handleAddCampaign = (campaign: MarketingCampaign) => {
    setCampaigns(prev => [campaign, ...prev]);
  };

  const handleAddComplaint = (complaint: CSComplaint) => {
    setComplaints(prev => [complaint, ...prev]);
  };

  const handleAddEmployee = (employee: HRDEmployee) => {
    setEmployees(prev => [employee, ...prev]);
  };

  const handleApproveDocumentStep = (docId: string, stepName: string) => {
    setDocs(prev => prev.map(d => {
      if (d.id === docId) {
        const updatedWorkflow = d.approvalWorkflow.map(step => {
          if (step.step === stepName) {
            return { ...step, approved: true, approvedAt: new Date().toISOString() };
          }
          return step;
        });

        // If all approved, status = Approved
        const allApproved = updatedWorkflow.every(w => w.approved);
        return {
          ...d,
          approvalWorkflow: updatedWorkflow,
          status: allApproved ? 'Approved' : d.status
        } as DocumentHub;
      }
      return d;
    }));
  };

  const handleAddWhatsAppLog = (log: WhatsAppLog) => {
    setWhatsappLogs(prev => [log, ...prev]);
  };

  // Cross-navigation helper
  const handleNavigate = (tab: string, subTab?: string) => {
    setActiveTab(tab as any);
    if (subTab) setActiveSubTab(subTab);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-150 transition-colors duration-200">
      
      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={`${
          isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'
        } fixed inset-y-0 left-0 bg-slate-900 text-slate-300 border-r border-slate-800 z-40 transition-all duration-300 flex flex-col shrink-0`}
      >
        {/* Brand logo container */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-emerald-600 text-white rounded-lg">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <span className="text-sm font-black text-white tracking-wider block">DEVELOPERPRO</span>
              <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase">Enterprise ERP</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User profile capsule */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-800/80 border border-emerald-600 flex items-center justify-center font-bold text-white shadow-inner">
            SA
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-200 block truncate">Sahrul Viona</span>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider block">Super Administrator</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          
          <button
            type="button"
            onClick={() => handleNavigate('dashboard')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-3 cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-inner' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-4 w-4 text-emerald-500" />
            Dashboard Utama
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('finance', 'sales')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-3 cursor-pointer ${
              activeTab === 'finance' 
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-inner' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="h-4 w-4 text-emerald-500" />
            Keuangan & Sales
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('project', 'timeline')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-3 cursor-pointer ${
              activeTab === 'project' 
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-inner' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardHat className="h-4 w-4 text-emerald-500" />
            Teknis & Proyek
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('ai-calc')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-3 cursor-pointer ${
              activeTab === 'ai-calc' 
                ? 'bg-slate-850 text-emerald-400 border border-slate-750 shadow-inner' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="h-4 w-4 text-emerald-500 animate-pulse" />
            Kalkulator Kelayakan AI
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('core')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-3 cursor-pointer ${
              activeTab === 'core' 
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-inner' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Landmark className="h-4 w-4 text-emerald-500" />
            Sistem Divisi ERP
          </button>

        </nav>

        {/* Sidebar footer status */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-[10px] text-slate-500 font-mono flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Sertifikasi SSL Aktif</span>
        </div>
      </aside>

      {/* MAIN MAIN INTERACTIVE VIEW AREA */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'pl-0 lg:pl-64' : 'pl-0'}`}>
        
        {/* TOP HEADER CONTROLS */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 px-5 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
            <h1 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Wijaya Karya Cipta Property Group
            </h1>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Quick stats tag */}
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping"></span>
              Sistem Online
            </span>

            {/* Dark Mode toggle button */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white bg-slate-50 dark:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Ganti Tema"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-600" />}
            </button>
          </div>
        </header>

        {/* CONTAINER CONTENT ROUTE */}
        <main className="flex-1 p-5 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {activeTab === 'dashboard' && (
            <Dashboard 
              projects={projects} 
              sales={salesList} 
              docs={docs} 
              complaints={complaints}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceModule
              salesList={salesList}
              projects={projects}
              onAddSales={handleAddSales}
              onUpdateSalesStatus={handleUpdateSalesStatus}
              addAuditLog={addAuditLog}
              activeSubTab={activeSubTab}
            />
          )}

          {activeTab === 'project' && (
            <ProjectModule
              projects={projects}
              salesList={salesList}
              onUpdateMilestone={handleUpdateMilestone}
              onAddConstructionLog={handleAddConstructionLog}
              onAddLandAcquisition={handleAddLandAcquisition}
              addAuditLog={addAuditLog}
              activeSubTab={activeSubTab}
            />
          )}

          {activeTab === 'ai-calc' && (
            <AICalculator 
              addAuditLog={addAuditLog}
            />
          )}

          {activeTab === 'core' && (
            <CoreModules
              campaigns={campaigns}
              complaints={complaints}
              employees={employees}
              docs={docs}
              sops={sops}
              forms={forms}
              auditLogs={auditLogs}
              whatsappLogs={whatsappLogs}
              onAddCampaign={handleAddCampaign}
              onAddComplaint={handleAddComplaint}
              onAddEmployee={handleAddEmployee}
              onApproveDocumentStep={handleApproveDocumentStep}
              onAddWhatsAppLog={handleAddWhatsAppLog}
              addAuditLog={addAuditLog}
            />
          )}

        </main>

      </div>

    </div>
  );
}
