import { useState } from 'react';
import { formatRupiah } from '../utils/helpers';
import { Sparkles, Brain, Landmark, AlertTriangle, Loader2 } from 'lucide-react';

interface AICalculatorProps {
  addAuditLog: (action: string, details: string) => void;
}

export default function AICalculator({ addAuditLog }: AICalculatorProps) {
  const [params, setParams] = useState({
    projectName: 'Cilebut Green Residence',
    landAreaSqm: '10000',
    landPricePerSqm: '1500000',
    constructionPricePerSqm: '4000000',
    totalPlannedUnits: '80',
    avgSellingPricePerUnit: '1200000000',
    infrastructureCostEst: '5000000000',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Computed local inputs
  const rawLandCost = Number(params.landAreaSqm) * Number(params.landPricePerSqm);
  // Estimate total construction floor area (e.g. 60 sqm average per unit x total units)
  const estConstructionCost = Number(params.totalPlannedUnits) * 60 * Number(params.constructionPricePerSqm);
  const estTotalRevenue = Number(params.totalPlannedUnits) * Number(params.avgSellingPricePerUnit);
  const totalCostEstimate = rawLandCost + estConstructionCost + Number(params.infrastructureCostEst);
  const projectedGrossProfit = estTotalRevenue - totalCostEstimate;

  const handleCalculateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAiAnalysis(null);
    setError(null);

    try {
      const res = await fetch('/api/ai/analyze-investment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setAiAnalysis(data.analysis);
          addAuditLog('INVESTMENT_AI_ANALYZE', `Menjalankan studi kelayakan investasi AI untuk proyek ${params.projectName}`);
        }
      } else {
        const errData = await res.json();
        setError(errData.error || 'Gagal menghubungi server AI.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Kalkulator Kelayakan Investasi AI</h2>
        <p className="text-xs text-slate-400 font-semibold">Menggunakan Gemini AI untuk melakukan simulasi studi kelayakan, IRR, sensitivitas harga, dan mitigasi risiko proyek real estate</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left inputs */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="p-1.5 bg-emerald-500 text-white rounded-lg">
              <Landmark className="h-4 w-4" />
            </span>
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Parameter Rencana Proyek</h3>
          </div>

          <form onSubmit={handleCalculateAI} className="space-y-3.5 text-xs">
            
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Proyek Properti</label>
              <input
                type="text"
                required
                value={params.projectName}
                onChange={e => setParams(prev => ({ ...prev, projectName: e.target.value }))}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Luas Lahan Utama (m²)</label>
                <input
                  type="number"
                  required
                  value={params.landAreaSqm}
                  onChange={e => setParams(prev => ({ ...prev, landAreaSqm: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Harga Lahan per m² (Rp)</label>
                <input
                  type="number"
                  required
                  value={params.landPricePerSqm}
                  onChange={e => setParams(prev => ({ ...prev, landPricePerSqm: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Estimasi Unit Terencana</label>
                <input
                  type="number"
                  required
                  value={params.totalPlannedUnits}
                  onChange={e => setParams(prev => ({ ...prev, totalPlannedUnits: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Harga Jual Rata² / Unit (Rp)</label>
                <input
                  type="number"
                  required
                  value={params.avgSellingPricePerUnit}
                  onChange={e => setParams(prev => ({ ...prev, avgSellingPricePerUnit: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Biaya Bangun per m² (Rp)</label>
                <input
                  type="number"
                  required
                  value={params.constructionPricePerSqm}
                  onChange={e => setParams(prev => ({ ...prev, constructionPricePerSqm: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Estimasi Infrastruktur (Rp)</label>
                <input
                  type="number"
                  required
                  value={params.infrastructureCostEst}
                  onChange={e => setParams(prev => ({ ...prev, infrastructureCostEst: e.target.value }))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Local calculations preview */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg space-y-1.5 border border-slate-200 dark:border-slate-800 font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400 text-[10px]">Total Investasi Lahan:</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">{formatRupiah(rawLandCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[10px]">Estimasi Biaya Proyek:</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">{formatRupiah(totalCostEstimate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[10px]">Total Revenue Jual (GDV):</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">{formatRupiah(estTotalRevenue)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5 font-bold">
                <span className="text-emerald-600 text-[10px]">Proyeksi Margin Kas:</span>
                <span className="text-emerald-600 font-mono">{formatRupiah(projectedGrossProfit)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menganalisis Finansial Proyek...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Kalkulasi Kelayakan dengan Gemini AI
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right output */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm min-h-[350px] flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Hasil Analisis & Studi Kelayakan Gemini</h3>
            </div>
            <span className="text-[9px] font-bold text-slate-400">Gemini-3.5-Flash</span>
          </div>

          <div className="flex-1 mt-4 text-xs leading-relaxed overflow-y-auto max-h-[480px] pr-2">
            {isLoading && (
              <div className="h-full flex flex-col justify-center items-center py-20 space-y-3">
                <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                <div className="text-center space-y-1">
                  <p className="font-bold text-slate-700 dark:text-slate-300">Menjalankan Evaluasi Skenario Bisnis...</p>
                  <p className="text-[10px] text-slate-450">Memproyeksikan Net Present Value (NPV), Payback Period, dan mitigasi risiko.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-800 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!isLoading && !error && aiAnalysis && (
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-750 dark:text-slate-300 whitespace-pre-line font-medium">
                {aiAnalysis}
              </div>
            )}

            {!isLoading && !error && !aiAnalysis && (
              <div className="h-full flex flex-col justify-center items-center py-24 text-center text-slate-400 space-y-3">
                <Brain className="h-10 w-10 text-slate-300 dark:text-slate-750" />
                <div>
                  <p className="font-bold">Menunggu Simulasi...</p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Isi parameter properti di sebelah kiri dan klik tombol kalkulasi untuk meluncurkan analisis kelayakan AI.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
