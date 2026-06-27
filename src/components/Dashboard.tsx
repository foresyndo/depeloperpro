import { Project, Sales, DocumentHub, CSComplaint } from '../types';
import { formatRupiah } from '../utils/helpers';
import { 
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar
} from 'recharts';
import { 
  Building2, DollarSign, MapPin, Landmark, ArrowUpRight, 
  CheckCircle2, AlertTriangle, FileText, Activity
} from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  sales: Sales[];
  docs: DocumentHub[];
  complaints: CSComplaint[];
  onNavigate: (tab: string, subTab?: string) => void;
}

export default function Dashboard({ projects, sales, docs, complaints, onNavigate }: DashboardProps) {
  // 1. Calculate KPI Metrics
  const totalUnitBooked = sales.length;
  
  // Total Piutang = Total price - dpAmount - bookingFee (excluding Completed/Handover unit sales if desired, or all active)
  const totalPiutang = sales
    .filter(s => s.status !== 'Handover')
    .reduce((acc, s) => acc + (s.totalPrice - s.dpAmount - s.bookingFee), 0);

  // Total Land Area in Sqm
  const totalLandSqm = projects.reduce((acc, p) => 
    acc + p.landAcquisitions.reduce((lAcc, l) => lAcc + l.areaSqm, 0)
  , 0);

  // Average milestone progress of all projects
  const allMilestones = projects.flatMap(p => p.milestones);
  const avgProgress = allMilestones.length > 0 
    ? Math.round(allMilestones.reduce((acc, m) => acc + m.progressPercentage, 0) / allMilestones.length)
    : 0;

  // 2. Generate S-Curve Data dynamically for Menteng Heights (PRJ-001)
  // To simulate an S-curve, we map planned vs actual cumulative progress month-by-month
  const sCurveData = [
    { month: 'Jan', Rencana: 10, Realisasi: 10 },
    { month: 'Feb', Rencana: 25, Realisasi: 23 },
    { month: 'Mar', Rencana: 45, Realisasi: 42 },
    { month: 'Apr', Rencana: 60, Realisasi: 58 },
    { month: 'Mei', Rencana: 75, Realisasi: 72 },
    { month: 'Jun', Rencana: 85, Realisasi: 80 },
    { month: 'Jul', Rencana: 92, Realisasi: null },
    { month: 'Agu', Rencana: 96, Realisasi: null },
    { month: 'Sep', Rencana: 100, Realisasi: null }
  ];

  // 3. Sales performance Chart data
  const salesPerformanceData = projects.map(p => {
    const pSales = sales.filter(s => s.projectName === p.name);
    const totalVolume = pSales.reduce((acc, s) => acc + s.totalPrice, 0);
    const bookingReceived = pSales.reduce((acc, s) => acc + s.bookingFee, 0);
    return {
      name: p.name.split(' ')[0], // First word like Menteng or Griya
      'Nilai Penjualan': totalVolume,
      'Booking Fee': bookingReceived
    };
  });

  // 4. Counts
  const pendingDocsCount = docs.filter(d => d.status === 'Review').length;
  const activeComplaintsCount = complaints.filter(c => c.status !== 'Resolved').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 id="dashboard-title" className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
            Eksekutif Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            DeveloperPro ERP • Real-Time Enterprise Analytics
          </p>
        </div>
        <div className="text-right text-[11px] font-mono text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
          SISTEM AKTIF • UTC: {new Date().toISOString().slice(0, 16).replace('T', ' ')}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Unit Terbooking */}
        <div 
          onClick={() => onNavigate('finance', 'sales')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Unit Terbooking</span>
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight block">
                {totalUnitBooked} <span className="text-xs font-semibold text-slate-400">Kavling</span>
              </span>
            </div>
            <span className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[11px] font-bold text-emerald-600">
            <ArrowUpRight className="h-4 w-4" />
            <span>100% Prospektif Aktif</span>
          </div>
        </div>

        {/* Card 2: Total Piutang Aktif */}
        <div 
          onClick={() => onNavigate('finance', 'sales')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Piutang KPR & Bertahap</span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight block truncate">
                {formatRupiah(totalPiutang)}
              </span>
            </div>
            <span className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-105 transition-transform">
              <DollarSign className="h-5 w-5" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-5 text-[11px] font-bold text-slate-500">
            <Activity className="h-3.5 w-3.5 text-blue-500" />
            <span>Menunggu SPU & Akad Bank</span>
          </div>
        </div>

        {/* Card 3: Total Pembebasan Lahan */}
        <div 
          onClick={() => onNavigate('project', 'land')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Luas Lahan Terbebaskan</span>
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight block">
                {totalLandSqm.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-400">m²</span>
              </span>
            </div>
            <span className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl group-hover:scale-105 transition-transform">
              <MapPin className="h-5 w-5" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[11px] font-bold text-amber-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Sertifikasi SHM/HGB Clean</span>
          </div>
        </div>

        {/* Card 4: Progress Fisik Rata-rata */}
        <div 
          onClick={() => onNavigate('project', 'timeline')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-purple-500 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Konstruksi Rata-rata</span>
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight block">
                {avgProgress}% <span className="text-xs font-semibold text-slate-400">Selesai</span>
              </span>
            </div>
            <span className="p-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-105 transition-transform">
              <Landmark className="h-5 w-5" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[11px] font-bold text-purple-600">
            <ArrowUpRight className="h-4 w-4" />
            <span>S-Curve Deviasi Positif</span>
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Chart: S-Curve (Recharts Line) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Kurva S Kemajuan Proyek</h3>
              <p className="text-[11px] text-slate-400 font-semibold">Proyek Utama: Menteng Heights Residence (Persentase Kumulatif)</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 animate-pulse" />
              Tepat Waktu
            </span>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '8px', 
                    border: 'none', 
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="Rencana" name="Kurva Rencana (%)" stroke="#94a3b8" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Realisasi" name="Kurva Realisasi (%)" stroke="#059669" strokeWidth={3} activeDot={{ r: 8 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Volume Sales (Recharts Bar) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Nilai Penjualan Per Proyek</h3>
              <p className="text-[11px] text-slate-400 font-semibold">Volume omset penjualan vs booking fee masuk</p>
            </div>
            <span className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-lg">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesPerformanceData} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tickFormatter={v => `${(v / 1e9).toFixed(1)}M`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  formatter={(value: any) => formatRupiah(value)}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '8px', 
                    border: 'none', 
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="Nilai Penjualan" name="Omset Proyek" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Booking Fee" name="DP & Booking Masuk" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Actionable Alerts & Operations Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Pending E-Signatures & Document Verifications */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Menunggu Tanda Tangan E-Signature ({pendingDocsCount})
            </h3>
            <button 
              onClick={() => onNavigate('core', 'docs')}
              className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {docs.slice(0, 3).map(doc => (
              <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{doc.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Ver. {doc.version} • Oleh {doc.uploadedBy}</p>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded shrink-0 ${
                  doc.status === 'Approved' 
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700' 
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Customer Complaints Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              Komplain Unit Aktif ({activeComplaintsCount})
            </h3>
            <button 
              onClick={() => onNavigate('core', 'cs')}
              className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
            >
              Lihat Detail
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {complaints.filter(c => c.status !== 'Resolved').slice(0, 3).map(c => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                    Unit {c.unitCode} - {c.issueType}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{c.description}</p>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded shrink-0 ${
                  c.status === 'New' 
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700' 
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700'
                }`}>
                  {c.status === 'New' ? 'New' : 'Proses'}
                </span>
              </div>
            ))}
            {complaints.filter(c => c.status !== 'Resolved').length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center font-medium">Semua keluhan komplain selesai diselesaikan ✓</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
