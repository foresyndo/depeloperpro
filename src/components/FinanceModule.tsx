import { useState } from 'react';
import { Sales, Project } from '../types';
import { formatRupiah, exportToExcel } from '../utils/helpers';
import { 
  Plus, Search, Download, Eye, User, FileUp, 
  Sparkles, CheckCircle2, ShieldAlert
} from 'lucide-react';

interface FinanceModuleProps {
  salesList: Sales[];
  projects: Project[];
  onAddSales: (newSales: Sales) => void;
  onUpdateSalesStatus: (salesId: string, status: Sales['status']) => void;
  addAuditLog: (action: string, details: string) => void;
  activeSubTab: string;
}

export default function FinanceModule({ 
  salesList, 
  projects, 
  onAddSales, 
  onUpdateSalesStatus, 
  addAuditLog,
  activeSubTab: initialSubTab
}: FinanceModuleProps) {
  const [subTab, setSubTab] = useState<'sales' | 'commission'>(initialSubTab === 'commission' ? 'commission' : 'sales');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New Sales form state
  const [newSales, setNewSales] = useState({
    customerName: '',
    nik: '',
    kkNumber: '',
    address: '',
    phoneNumber: '',
    projectName: 'Menteng Heights Residence',
    unitCode: '',
    totalPrice: '',
    paymentMethod: 'KPR' as 'KPR' | 'Cash Bertahap' | 'Cash Keras',
    bookingFee: '20000000',
    dpAmount: '0',
  });

  const [isScanningKK, setIsScanningKK] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSalesDetails, setSelectedSalesDetails] = useState<Sales | null>(null);

  // File Upload base64 extractor for Gemini AI Scanner
  const handleKKUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningKK(true);
    setScanFeedback(null);
    setScanError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result?.toString().split(',')[1];
        if (!base64String) {
          setScanError("Gagal memproses berkas gambar.");
          setIsScanningKK(false);
          return;
        }

        // Call the AI Scanner endpoint
        const res = await fetch('/api/ai/scan-kk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Image: base64String })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.error) {
            setScanError(data.error);
          } else {
            // Fill form with AI extracted fields
            setNewSales(prev => ({
              ...prev,
              customerName: data.customerName || prev.customerName,
              nik: data.nik || prev.nik,
              kkNumber: data.kkNumber || prev.kkNumber,
              address: data.address || prev.address,
            }));
            setScanFeedback("Kartu Keluarga berhasil dipindai oleh Gemini AI! Form telah otomatis terisi.");
          }
        } else {
          const errData = await res.json();
          setScanError(errData.error || "Kesalahan server saat memindai gambar.");
        }
        setIsScanningKK(false);
      };
      reader.onerror = () => {
        setScanError("Gagal membaca file gambar.");
        setIsScanningKK(false);
      };
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || "Terjadi kesalahan koneksi.");
      setIsScanningKK(false);
    }
  };

  const handleCreateSales = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSales.customerName || !newSales.unitCode || !newSales.totalPrice) {
      alert("Harap lengkapi isian form.");
      return;
    }

    const tPrice = Number(newSales.totalPrice);
    const item: Sales = {
      id: `SLS-${Math.floor(100 + Math.random() * 900)}`,
      customerName: newSales.customerName,
      nik: newSales.nik,
      kkNumber: newSales.kkNumber,
      address: newSales.address,
      phoneNumber: newSales.phoneNumber,
      projectName: newSales.projectName,
      unitCode: newSales.unitCode,
      bookingFee: Number(newSales.bookingFee),
      bookingDate: new Date().toISOString().split('T')[0],
      paymentMethod: newSales.paymentMethod,
      dpAmount: Number(newSales.dpAmount),
      totalPrice: tPrice,
      status: 'Booking',
      marketingCommission: Math.round(tPrice * 0.03), // 3%
      salesCommission: Math.round(tPrice * 0.01) // 1%
    };

    onAddSales(item);
    addAuditLog('SALES_CREATE', `Mencatat prospek booking baru: unit ${item.unitCode} oleh customer ${item.customerName}`);
    
    // Clear state
    setNewSales({
      customerName: '',
      nik: '',
      kkNumber: '',
      address: '',
      phoneNumber: '',
      projectName: 'Menteng Heights Residence',
      unitCode: '',
      totalPrice: '',
      paymentMethod: 'KPR',
      bookingFee: '20000000',
      dpAmount: '0',
    });
    setScanFeedback(null);
    setScanError(null);
    setIsModalOpen(false);
  };

  // Filter Sales list
  const filteredSales = salesList.filter(s => {
    const matchSearch = s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        s.unitCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProject = projectFilter === 'ALL' || s.projectName === projectFilter;
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchProject && matchStatus;
  });

  const handleExport = () => {
    exportToExcel(filteredSales, `Data_Penjualan_ERP`);
    addAuditLog('EXCEL_EXPORT', 'Mengekspor laporan keuangan penjualan ke CSV/Excel');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header and Toggles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Divisi Keuangan & Sales</h2>
          <p className="text-xs text-slate-400 font-semibold">Pemantauan booking fee, pembayaran DP, KPR, dan pelunasan cash keras</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setSubTab('sales')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
              subTab === 'sales' 
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Unit Booking & SPU
          </button>
          <button
            type="button"
            onClick={() => setSubTab('commission')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
              subTab === 'commission' 
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Kalkulasi Komisi Agency
          </button>
        </div>
      </div>

      {subTab === 'sales' && (
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
            
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari unit atau nama pembeli..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg w-full sm:w-60 bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200"
                />
              </div>

              <select
                value={projectFilter}
                onChange={e => setProjectFilter(e.target.value)}
                className="text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200"
              >
                <option value="ALL">Semua Proyek</option>
                {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200"
              >
                <option value="ALL">Semua Status</option>
                <option value="Booking">Booking</option>
                <option value="DP_Paid">DP Paid</option>
                <option value="SPU">SPU</option>
                <option value="Pemberkasan">Pemberkasan</option>
                <option value="Akad">Akad</option>
                <option value="Handover">Handover</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={handleExport}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Ekspor CSV
              </button>
              
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Catat Booking Unit
              </button>
            </div>

          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="p-3">Customer & NIK</th>
                    <th className="p-3">Proyek & Unit</th>
                    <th className="p-3">Tipe Bayar</th>
                    <th className="p-3 text-right">Booking Fee</th>
                    <th className="p-3 text-right">DP Dibayar</th>
                    <th className="p-3 text-right">Total Harga</th>
                    <th className="p-3 text-center">Status SPU</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredSales.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{item.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIK: {item.nik || '-'}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">{item.projectName}</div>
                        <div className="text-[10px] font-bold text-emerald-600">Unit {item.unitCode}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">{item.paymentMethod}</td>
                      <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">{formatRupiah(item.bookingFee)}</td>
                      <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">{formatRupiah(item.dpAmount)}</td>
                      <td className="p-3 text-right font-black text-slate-800 dark:text-slate-100">{formatRupiah(item.totalPrice)}</td>
                      <td className="p-3 text-center">
                        <select
                          value={item.status}
                          onChange={e => {
                            onUpdateSalesStatus(item.id, e.target.value as Sales['status']);
                            addAuditLog('SALES_STATUS_CHANGE', `Mengubah status sales unit ${item.unitCode} menjadi ${e.target.value}`);
                          }}
                          className={`px-2 py-1 text-[10px] font-bold rounded border ${
                            item.status === 'Handover' 
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                              : item.status === 'Akad'
                              ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <option value="Booking">Booking</option>
                          <option value="DP_Paid">DP Paid</option>
                          <option value="SPU">SPU</option>
                          <option value="Pemberkasan">Pemberkasan</option>
                          <option value="Akad">Akad</option>
                          <option value="Handover">Handover</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedSalesDetails(item)}
                          className="p-1 text-slate-500 hover:text-blue-600 transition"
                          title="Lihat Berkas"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400">
                        Tidak ada data penjualan yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === 'commission' && (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
              <strong>Skema Komisi Otomatis:</strong> DeveloperPro ERP menghitung pengeluaran insentif secara real-time. Komisi Marketing Agency ditetapkan sebesar <strong>3.0%</strong> dan Insentif Sales In-House sebesar <strong>1.0%</strong> dari total nilai akad jual beli unit.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="p-3">ID Pembeli</th>
                    <th className="p-3">Customer & Unit</th>
                    <th className="p-3 text-right">Nilai Transaksi</th>
                    <th className="p-3 text-right">Komisi Agency (3%)</th>
                    <th className="p-3 text-right">Bonus Sales (1%)</th>
                    <th className="p-3 text-right">Total Beban Komisi</th>
                    <th className="p-3 text-center">Status Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredSales.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition">
                      <td className="p-3 font-mono font-bold text-slate-500">{item.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{item.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{item.projectName} - {item.unitCode}</div>
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-700 dark:text-slate-300">{formatRupiah(item.totalPrice)}</td>
                      <td className="p-3 text-right font-black text-amber-600">{formatRupiah(item.marketingCommission)}</td>
                      <td className="p-3 text-right font-black text-blue-600">{formatRupiah(item.salesCommission)}</td>
                      <td className="p-3 text-right font-black text-slate-800 dark:text-slate-100">
                        {formatRupiah(item.marketingCommission + item.salesCommission)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                          item.status === 'Akad' || item.status === 'Handover'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                        }`}>
                          {item.status === 'Akad' || item.status === 'Handover' ? 'Cair' : 'Pending Akad'}
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

      {/* CREATE SALES MODAL WITH GEMINI SCANNER */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl animate-slide-up">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Catat Booking & SPU Baru</h3>
                <p className="text-[10px] text-slate-400">Gunakan AI Scanner untuk auto-fill data secara instan</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              
              {/* GEMINI AI SCANNER SECTION */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-950 dark:to-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-500 text-white rounded-lg">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Gemini AI KK Image Scanner</h4>
                      <p className="text-[10px] text-slate-400">Unggah foto Kartu Keluarga untuk parsing data otomatis</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 rounded">
                    Online Server API
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleKKUpload}
                      disabled={isScanningKK}
                      id="kk-upload-input"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="border border-dashed border-emerald-300 hover:bg-emerald-50/50 dark:border-emerald-800 dark:hover:bg-slate-900/60 rounded-lg p-3 text-center transition">
                      <FileUp className="h-4 w-4 mx-auto text-emerald-600 mb-1" />
                      <span className="text-[10px] font-bold text-emerald-700 block">
                        {isScanningKK ? 'Sedang Membaca...' : 'Pilih Gambar KK'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500">
                    {isScanningKK && (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold animate-pulse">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
                        <span>Gemini sedang mengekstrak NIK, Nomor KK, Nama Lengkap, dan Alamat...</span>
                      </div>
                    )}
                    {!isScanningKK && scanFeedback && (
                      <div className="flex items-start gap-1 text-emerald-600 font-semibold bg-emerald-100/40 p-1.5 rounded border border-emerald-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{scanFeedback}</span>
                      </div>
                    )}
                    {!isScanningKK && scanError && (
                      <div className="flex items-start gap-1 text-rose-600 font-semibold bg-rose-100/40 p-1.5 rounded border border-rose-200">
                        <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{scanError}</span>
                      </div>
                    )}
                    {!isScanningKK && !scanFeedback && !scanError && (
                      <span className="italic block leading-normal">Mendukung format PNG, JPG, dan JPEG. Pastikan foto tulisan data KK terbaca jelas dan berorientasi normal.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Form inputs */}
              <form onSubmit={handleCreateSales} className="space-y-4">
                
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5">Identitas Konsumen</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Lengkap Pembeli</label>
                    <input
                      type="text"
                      required
                      value={newSales.customerName}
                      onChange={e => setNewSales(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="e.g. Irwan Setiawan"
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nomor HP</label>
                    <input
                      type="text"
                      required
                      value={newSales.phoneNumber}
                      onChange={e => setNewSales(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="e.g. 0812XXXXXXXX"
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nomor NIK (KTP)</label>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      value={newSales.nik}
                      onChange={e => setNewSales(prev => ({ ...prev, nik: e.target.value }))}
                      placeholder="e.g. 31710123XXXXXXXX"
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nomor Kartu Keluarga (KK)</label>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      value={newSales.kkNumber}
                      onChange={e => setNewSales(prev => ({ ...prev, kkNumber: e.target.value }))}
                      placeholder="e.g. 31710123XXXXXXXX"
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Alamat Lengkap</label>
                  <textarea
                    required
                    rows={2}
                    value={newSales.address}
                    onChange={e => setNewSales(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Alamat domisili sesuai KTP..."
                    className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200"
                  />
                </div>

                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5 pt-2">Spesifikasi Pembelian Unit</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Proyek Property</label>
                    <select
                      value={newSales.projectName}
                      onChange={e => setNewSales(prev => ({ ...prev, projectName: e.target.value }))}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200"
                    >
                      {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kode Unit Kavling</label>
                    <input
                      type="text"
                      required
                      value={newSales.unitCode}
                      onChange={e => setNewSales(prev => ({ ...prev, unitCode: e.target.value }))}
                      placeholder="e.g. A-12B"
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Harga Jual (Rp)</label>
                    <input
                      type="number"
                      required
                      value={newSales.totalPrice}
                      onChange={e => setNewSales(prev => ({ ...prev, totalPrice: e.target.value }))}
                      placeholder="e.g. 1500000000"
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Skema Pembayaran</label>
                    <select
                      value={newSales.paymentMethod}
                      onChange={e => setNewSales(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200"
                    >
                      <option value="KPR">KPR</option>
                      <option value="Cash Bertahap">Cash Bertahap</option>
                      <option value="Cash Keras">Cash Keras</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Booking Fee (Rp)</label>
                    <input
                      type="number"
                      required
                      value={newSales.bookingFee}
                      onChange={e => setNewSales(prev => ({ ...prev, bookingFee: e.target.value }))}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">DP Dibayarkan (Rp)</label>
                    <input
                      type="number"
                      required
                      value={newSales.dpAmount}
                      onChange={e => setNewSales(prev => ({ ...prev, dpAmount: e.target.value }))}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-emerald-500 text-slate-700 dark:text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Simpan SPU & Catat
                  </button>
                </div>

              </form>

            </div>

          </div>
        </div>
      )}

      {/* DETAIL CONSOLE / BERKAS SALES MODAL */}
      {selectedSalesDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl animate-slide-up p-6 space-y-4">
            
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
                  <User className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Berkas Konsumen</h3>
                  <p className="text-[10px] text-slate-400">Verifikasi Dokumen Jual Beli Kavling</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSalesDetails(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-50 dark:border-slate-850 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID Transaksi</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedSalesDetails.id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tanggal Booking</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedSalesDetails.bookingDate}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Lengkap</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{selectedSalesDetails.customerName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor NIK</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{selectedSalesDetails.nik || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor KK</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{selectedSalesDetails.kkNumber || '-'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alamat Domisili</span>
                <span className="text-slate-600 dark:text-slate-400">{selectedSalesDetails.address || '-'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unit Proyek</span>
                  <span className="font-bold text-emerald-600">{selectedSalesDetails.projectName} - {selectedSalesDetails.unitCode}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Bayar</span>
                  <span className="font-bold text-blue-600">{selectedSalesDetails.status}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSalesDetails(null)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Selesai Verifikasi
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
