import { useState } from 'react';
import { Project, LandAcquisition, ProjectMilestone, ConstructionLog, Sales } from '../types';
import { formatRupiah, exportToExcel } from '../utils/helpers';
import { exportReportToPDF } from '../utils/pdfExport';
import { 
  Plus, Calendar, Map, ClipboardList, TrendingUp, HardHat, CloudSun, Download
} from 'lucide-react';

interface ProjectModuleProps {
  projects: Project[];
  salesList: Sales[];
  onUpdateMilestone: (projectId: string, milestoneId: string, progress: number, status: ProjectMilestone['status']) => void;
  onAddConstructionLog: (projectId: string, log: ConstructionLog) => void;
  onAddLandAcquisition: (projectId: string, land: LandAcquisition) => void;
  addAuditLog: (action: string, details: string) => void;
  activeSubTab: string;
}

export default function ProjectModule({
  projects,
  salesList,
  onUpdateMilestone,
  onAddConstructionLog,
  onAddLandAcquisition,
  addAuditLog,
  activeSubTab: initialSubTab
}: ProjectModuleProps) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [subTab, setSubTab] = useState<'land' | 'legal' | 'timeline' | 'logs'>(
    initialSubTab === 'timeline' ? 'timeline' : initialSubTab === 'land' ? 'land' : 'timeline'
  );

  // Form states
  const [newLand, setNewLand] = useState({
    location: '',
    areaSqm: '',
    pricePerMeter: '',
    ownerName: '',
    notaryName: 'Kartika Sari, S.H., M.Kn.',
    shmNumber: '',
    notes: ''
  });

  const [newLog, setNewLog] = useState({
    weather: 'Sunny' as 'Sunny' | 'Rainy' | 'Cloudy',
    laborCount: '50',
    materialsDelivered: '',
    activities: '',
    issues: '',
    reporter: ''
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const handleCreateLand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLand.location || !newLand.areaSqm || !newLand.pricePerMeter || !newLand.ownerName) {
      alert("Harap isi semua kolom wajib.");
      return;
    }

    const sqm = Number(newLand.areaSqm);
    const priceM = Number(newLand.pricePerMeter);
    const item: LandAcquisition = {
      id: `LND-${Math.floor(100 + Math.random() * 900)}`,
      location: newLand.location,
      areaSqm: sqm,
      pricePerMeter: priceM,
      totalPrice: sqm * priceM,
      ownerName: newLand.ownerName,
      status: 'Negotiation',
      notaryName: newLand.notaryName,
      shmNumber: newLand.shmNumber,
      notes: newLand.notes
    };

    onAddLandAcquisition(selectedProject.id, item);
    addAuditLog('LAND_ACQUIRE_CREATE', `Mencatat pembebasan lahan baru di ${item.location} senilai ${formatRupiah(item.totalPrice)}`);
    
    // reset form
    setNewLand({
      location: '',
      areaSqm: '',
      pricePerMeter: '',
      ownerName: '',
      notaryName: 'Kartika Sari, S.H., M.Kn.',
      shmNumber: '',
      notes: ''
    });
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.activities || !newLog.reporter) {
      alert("Harap isi deskripsi kegiatan dan nama pelapor.");
      return;
    }

    const item: ConstructionLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      weather: newLog.weather,
      laborCount: Number(newLog.laborCount),
      materialsDelivered: newLog.materialsDelivered || 'Tidak ada material masuk',
      activities: newLog.activities,
      issues: newLog.issues || 'Aman terkendali',
      reporter: newLog.reporter
    };

    onAddConstructionLog(selectedProject.id, item);
    addAuditLog('CONSTRUCTION_LOG_CREATE', `Mencatat Buku Harian Lapangan proyek ${selectedProject.name} oleh ${item.reporter}`);

    // reset form
    setNewLog({
      weather: 'Sunny',
      laborCount: '50',
      materialsDelivered: '',
      activities: '',
      issues: '',
      reporter: ''
    });
  };

  const handleExportLand = () => {
    exportToExcel(selectedProject.landAcquisitions, `Pembebasan_Lahan_${selectedProject.name}`);
  };

  const handleExportLogs = () => {
    exportToExcel(selectedProject.constructionLogs, `Buku_Harian_${selectedProject.name}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Selector & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Teknis Pekerjaan Lapangan & Legalitas</h2>
          <p className="text-xs text-slate-400 font-semibold">Mengawasi progres S-Curve, pembebasan lahan kavling, perizinan SIP/PBG, dan buku harian konstruksi</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            id="export-pdf-project-btn"
            onClick={() => {
              exportReportToPDF(salesList, projects);
              addAuditLog('PDF_EXPORT', 'Mengekspor laporan teknis & keuangan ke PDF dari modul proyek');
            }}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Ekspor Laporan PDF
          </button>

          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            className="text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-slate-200 shadow-sm"
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Sub tabs selectors */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setSubTab('timeline')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition ${
            subTab === 'timeline'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          S-Curve & Milestone
        </button>
        <button
          type="button"
          onClick={() => setSubTab('land')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition ${
            subTab === 'land'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Pembebasan Lahan
        </button>
        <button
          type="button"
          onClick={() => setSubTab('legal')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition ${
            subTab === 'legal'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Legalitas / Izin
        </button>
        <button
          type="button"
          onClick={() => setSubTab('logs')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition ${
            subTab === 'logs'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Buku Harian Lapangan
        </button>
      </div>

      {/* TAB 1: S-CURVE TIMELINE & MILESTONES */}
      {subTab === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3">
            <HardHat className="h-5 w-5 text-emerald-600" />
            <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
              <strong>Pengendalian S-Curve:</strong> Geser persentase kemajuan fisik pada setiap milestone. Anggaran kumulatif dan deviasi kurva akan dikalkulasikan secara otomatis berdasarkan bobot pekerjaan masing-masing kontraktor.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Milestones Realisasi Lapangan</h3>
              <span className="text-[10px] font-bold text-slate-400">Total Budget: {formatRupiah(selectedProject.totalBudget)}</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {selectedProject.milestones.map(m => (
                <div key={m.id} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  
                  {/* Name and Weight */}
                  <div className="md:col-span-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold text-[9px] text-slate-500">{m.id}</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.name}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Mitra: <span className="font-bold">{m.contractorName}</span> • Bobot: <span className="font-bold text-slate-600 dark:text-slate-300">{m.weightPercentage}%</span>
                    </p>
                  </div>

                  {/* Dates */}
                  <div className="md:col-span-3 text-[10px] space-y-1">
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider block">Target Jadwal</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{m.plannedStartDate} s.d {m.plannedEndDate}</span>
                    </div>
                    {m.actualStartDate && (
                      <div>
                        <span className="text-emerald-600 font-bold uppercase tracking-wider block">Realisasi Mulai</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-400">{m.actualStartDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Control slider */}
                  <div className="md:col-span-3 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-400 uppercase tracking-wider">Persentase Fisik</span>
                      <span className="text-emerald-600 font-mono">{m.progressPercentage}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={m.progressPercentage}
                        onChange={e => {
                          const val = Number(e.target.value);
                          const status: ProjectMilestone['status'] = val === 0 ? 'Not_Started' : val === 100 ? 'Completed' : 'In_Progress';
                          onUpdateMilestone(selectedProject.id, m.id, val, status);
                        }}
                        className="w-full accent-emerald-600 h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Status selection */}
                  <div className="md:col-span-2 text-right">
                    <select
                      value={m.status}
                      onChange={e => {
                        const s = e.target.value as ProjectMilestone['status'];
                        const val = s === 'Completed' ? 100 : s === 'Not_Started' ? 0 : m.progressPercentage;
                        onUpdateMilestone(selectedProject.id, m.id, val, s);
                        addAuditLog('MILESTONE_UPDATE', `Mengubah status milestone ${m.name} menjadi ${s}`);
                      }}
                      className={`text-[10px] font-black p-1.5 rounded border uppercase ${
                        m.status === 'Completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border-emerald-200 dark:border-emerald-800'
                          : m.status === 'In_Progress'
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 border-blue-200'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <option value="Not_Started">Not Started</option>
                      <option value="In_Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Delayed">Delayed</option>
                    </select>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LAND ACQUISITIONS */}
      {subTab === 'land' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <Map className="h-4 w-4 text-emerald-600" />
              Input Akuisisi Lahan
            </h3>

            <form onSubmit={handleCreateLand} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Lokasi Bidang / Kavling</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kavling Utara Menteng"
                  value={newLand.location}
                  onChange={e => setNewLand(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Luas Tanah (m²)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={newLand.areaSqm}
                    onChange={e => setNewLand(prev => ({ ...prev, areaSqm: e.target.value }))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Harga per Meter (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2000000"
                    value={newLand.pricePerMeter}
                    onChange={e => setNewLand(prev => ({ ...prev, pricePerMeter: e.target.value }))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Pemilik Lahan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haji Sulaiman"
                  value={newLand.ownerName}
                  onChange={e => setNewLand(prev => ({ ...prev, ownerName: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nomor SHM / HGB</label>
                <input
                  type="text"
                  placeholder="e.g. SHM No. 841"
                  value={newLand.shmNumber}
                  onChange={e => setNewLand(prev => ({ ...prev, shmNumber: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Keterangan / Catatan Notaris</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan proses legalitas tanah..."
                  value={newLand.notes}
                  onChange={e => setNewLand(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Catat Lahan Baru
              </button>
            </form>
          </div>

          {/* Right Table */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Daftar Tanah Terakuisisi</h3>
              <button
                type="button"
                onClick={handleExportLand}
                className="p-1 text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Ekspor Lahan
              </button>
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[9px] uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                    <th className="p-2">Bidang Lahan & Pemilik</th>
                    <th className="p-2">Sertifikat</th>
                    <th className="p-2 text-right">Luas (m²)</th>
                    <th className="p-2 text-right">Nilai Jual</th>
                    <th className="p-2 text-center">Status Pembebasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {selectedProject.landAcquisitions.map(land => (
                    <tr key={land.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition">
                      <td className="p-2">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{land.location}</div>
                        <div className="text-[10px] text-slate-400 font-bold">Pemilik: {land.ownerName}</div>
                      </td>
                      <td className="p-2">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">{land.shmNumber}</div>
                        <div className="text-[10px] text-slate-400 italic">Notaris: {land.notaryName}</div>
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-600 dark:text-slate-400">{land.areaSqm.toLocaleString()} m²</td>
                      <td className="p-2 text-right font-black text-slate-800 dark:text-slate-100">{formatRupiah(land.totalPrice)}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          land.status === 'Fully_Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                        }`}>
                          {land.status}
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

      {/* TAB 3: LEGAL / MUNICIPAL PERMITS */}
      {subTab === 'legal' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Perizinan Hukum & Dinas Tata Kota</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="p-3">Nama Berkas Izin</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Instansi Penerbit</th>
                  <th className="p-3">Tanggal Terbit</th>
                  <th className="p-3">Berlaku S.D</th>
                  <th className="p-3 text-center">Status Legalitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {selectedProject.legalDocuments.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition">
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{doc.name}</td>
                    <td className="p-3 font-semibold text-slate-500 uppercase text-[9px]">{doc.category.replace('_', ' ')}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">{doc.issuer}</td>
                    <td className="p-3 font-mono text-slate-500">{doc.issuedDate}</td>
                    <td className="p-3 font-mono text-slate-500">{doc.expiryDate}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        doc.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                          : doc.status === 'In_Progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DAILY LOGS (CONSTRUCTION LOGS) */}
      {subTab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <ClipboardList className="h-4 w-4 text-emerald-600" />
              Lapor Harian Lapangan
            </h3>

            <form onSubmit={handleCreateLog} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cuaca</label>
                  <select
                    value={newLog.weather}
                    onChange={e => setNewLog(prev => ({ ...prev, weather: e.target.value as any }))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200"
                  >
                    <option value="Sunny">Sunny / Cerah</option>
                    <option value="Cloudy">Cloudy / Mendung</option>
                    <option value="Rainy">Rainy / Hujan</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Jumlah Pekerja</label>
                  <input
                    type="number"
                    required
                    value={newLog.laborCount}
                    onChange={e => setNewLog(prev => ({ ...prev, laborCount: e.target.value }))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Material Masuk</label>
                <input
                  type="text"
                  placeholder="e.g. Semen Padang 200 sak"
                  value={newLog.materialsDelivered}
                  onChange={e => setNewLog(prev => ({ ...prev, materialsDelivered: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Deskripsi Kegiatan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Aktivitas struktur / pengecoran di lapangan hari ini..."
                  value={newLog.activities}
                  onChange={e => setNewLog(prev => ({ ...prev, activities: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kendala / Masalah (Bila Ada)</label>
                <input
                  type="text"
                  placeholder="e.g. Supply beton terlambat 1 jam"
                  value={newLog.issues}
                  onChange={e => setNewLog(prev => ({ ...prev, issues: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Pengawas Lapangan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ir. Ahmad Fauzi (PM)"
                  value={newLog.reporter}
                  onChange={e => setNewLog(prev => ({ ...prev, reporter: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <ClipboardList className="h-4 w-4" />
                Kirim Buku Harian
              </button>
            </form>
          </div>

          {/* Right logs list */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Histori Laporan Harian (Site Book)</h3>
              <button
                type="button"
                onClick={handleExportLogs}
                className="p-1 text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Ekspor Buku Harian
              </button>
            </div>

            <div className="p-6 space-y-4">
              {selectedProject.constructionLogs.map(log => (
                <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 relative overflow-hidden">
                  
                  {/* Log Header */}
                  <div className="flex flex-wrap justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.date}</span>
                      <span className="font-mono text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 px-1.5 py-0.5 rounded font-black">{log.id}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <CloudSun className="h-3.5 w-3.5 text-amber-500" />
                        Cuaca: <strong className="text-slate-700 dark:text-slate-300">{log.weather}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Pekerja: <strong className="text-slate-700 dark:text-slate-300">{log.laborCount} Orang</strong>
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Aktivitas Konstruksi</span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{log.activities}</p>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Material Terkirim</span>
                        <p className="text-slate-600 dark:text-slate-400">{log.materialsDelivered}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block text-rose-500">Kendala Lapangan</span>
                        <p className="text-rose-600 dark:text-rose-450 font-bold">{log.issues}</p>
                      </div>
                    </div>
                  </div>

                  {/* Reporter Footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-450 font-bold">Dilaporkan Oleh: <strong className="text-slate-700 dark:text-slate-300">{log.reporter}</strong></span>
                    <span className="text-[9px] text-emerald-600 font-black uppercase bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">Verified</span>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
