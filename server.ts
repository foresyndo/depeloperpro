import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Hardcoded Port 3000 as requested by Environment Constraints
const PORT = 3000;

// Lazy initialization helper for Gemini AI SDK
let aiInstance: GoogleGenAI | null = null;
function getGeminiSDK(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is not defined in the workspace secrets.');
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiInstance;
}

// In-Memory Database for WhatsApp Gateway transmission history
const whatsappLogs: Array<{
  id: string;
  timestamp: string;
  recipientName: string;
  phone: string;
  role: string;
  message: string;
  type: string;
  status: 'Sent' | 'Failed';
}> = [
  {
    id: "WA-101",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    recipientName: "Budi Santoso",
    phone: "081199008811",
    role: "Kontraktor Utama",
    message: "Yth. Budi Santoso (WIKA). Penerbitan Surat Perintah Kerja (SPK) untuk paket pekerjaan *Pondasi Pancang* telah disetujui. Silakan periksa dashboard.",
    type: "Document Approval",
    status: "Sent"
  },
  {
    id: "WA-102",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    recipientName: "Hendra Setiawan",
    phone: "081255556666",
    role: "Vendor Semen",
    message: "Pemberitahuan PO Baru: PO-2026-102A senilai *Rp 450.000.000* untuk material *Semen Padang* telah diterbitkan. Harap konfirmasi pengiriman.",
    type: "Procurement PO",
    status: "Sent"
  }
];

// -------------------------------------------------------------------------
// 1. API: scan-kk (Kartu Keluarga Scanner using Gemini)
// -------------------------------------------------------------------------
app.post('/api/ai/scan-kk', async (req, res) => {
  const { base64Image } = req.body;
  if (!base64Image) {
    return res.status(400).json({ error: "Data base64Image diperlukan." });
  }

  try {
    const ai = getGeminiSDK();
    
    // Prepare multi-part content
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image
      }
    };

    const textPart = {
      text: `Anda adalah asisten AI ERP DeveloperPro yang bertugas mengekstrak data dari scan Kartu Keluarga (KK) Indonesia.
Silakan ekstrak informasi berikut dari gambar Kartu Keluarga ini dengan akurasi 100%:
1. Nama Kepala Keluarga / Anggota Keluarga yang paling terlihat jelas (customerName)
2. Nomor NIK KTP dari orang tersebut (nik - 16 digit angka)
3. Nomor Kartu Keluarga (kkNumber - 16 digit angka di bagian atas)
4. Alamat Lengkap tertulis (address)

Kembalikan respon hanya dalam bentuk JSON murni dengan format schema berikut:
{
  "customerName": "NAMA EKSTRAKSI",
  "nik": "16_DIGIT_NIK",
  "kkNumber": "16_DIGIT_KK",
  "address": "ALAMAT LENGKAP"
}`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json"
      }
    });

    const outputText = response.text || "{}";
    const data = JSON.parse(outputText.trim());
    return res.json(data);

  } catch (err: any) {
    console.error("Gemini Scan KK Error:", err);
    // If API key is missing or invalid, fallback with friendly notification
    if (err.message && err.message.includes("GEMINI_API_KEY")) {
      return res.status(400).json({
        error: "Kunci API Gemini belum diatur di Settings > Secrets. Mohon isi kunci Anda terlebih dahulu."
      });
    }
    return res.status(500).json({
      error: "Sistem gagal mengekstrak Kartu Keluarga: " + err.message
    });
  }
});

// -------------------------------------------------------------------------
// 2. API: analyze-investment (Gemini Investment Analyzer)
// -------------------------------------------------------------------------
app.post('/api/ai/analyze-investment', async (req, res) => {
  const {
    projectName,
    landAreaSqm,
    landPricePerSqm,
    constructionPricePerSqm,
    totalPlannedUnits,
    avgSellingPricePerUnit,
    infrastructureCostEst
  } = req.body;

  try {
    const ai = getGeminiSDK();

    const prompt = `Lakukan analisis studi kelayakan investasi properti real estate profesional untuk proyek pengembang:
- Nama Proyek: ${projectName}
- Luas Lahan: ${landAreaSqm} m²
- Harga Lahan: Rp ${Number(landPricePerSqm).toLocaleString()}/m²
- Biaya Konstruksi Rata²: Rp ${Number(constructionPricePerSqm).toLocaleString()}/m² (asumsi luas lantai rata-rata 60 m² per unit)
- Rencana Unit: ${totalPlannedUnits} unit rumah/ruko
- Target Harga Jual: Rp ${Number(avgSellingPricePerUnit).toLocaleString()}/unit
- Biaya Infrastruktur, Izin, & Utilitas: Rp ${Number(infrastructureCostEst).toLocaleString()}

Berikan laporan studi kelayakan eksekutif yang elegan dalam format Markdown. Susun dengan sub-judul yang jelas:
1. **Analisis Biaya Awal (Capital Expenditure)**: Total pembelian lahan, estimasi konstruksi unit, infrastruktur, & total pengeluaran.
2. **Potensi Pendapatan (Gross Development Value - GDV)**: Total omset penjualan unit.
3. **Proyeksi Margin Laba Kotor & Bersih**: ROI %, estimasi payback period, dan penilaian profitabilitas.
4. **Analisis Risiko Finansial**: Uraikan 3 risiko utama (e.g. suku bunga KPR naik, kelambatan akad, inflasi material semen) beserta mitigasi taktis pengembang.
5. **Rekomendasi Strategis**: Pendapat ahli apakah proyek layak dijalankan atau perlu penyesuaian harga jual unit.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    return res.json({ analysis: response.text });

  } catch (err: any) {
    console.error("Gemini Investment Analyze Error:", err);
    if (err.message && err.message.includes("GEMINI_API_KEY")) {
      return res.status(400).json({
        error: "Kunci API Gemini belum dikonfigurasi di Settings > Secrets."
      });
    }
    return res.status(500).json({
      error: "Sistem gagal mengalkulasi investasi: " + err.message
    });
  }
});

// -------------------------------------------------------------------------
// 3. API: whatsapp (Gateway transmission & log manager)
// -------------------------------------------------------------------------
app.get('/api/whatsapp/logs', (_req, res) => {
  return res.json({ logs: whatsappLogs });
});

app.post('/api/whatsapp/send', (req, res) => {
  const { phone, recipientName, role, message, type } = req.body;

  if (!phone || !recipientName || !message) {
    return res.status(400).json({ error: "Parameter phone, recipientName, dan message wajib disertakan." });
  }

  // Simulate a real API post call to an external WhatsApp Gateway
  // For safety and offline reliability, we create a fully validated dispatch log
  const newLog = {
    id: `WA-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString(),
    recipientName,
    phone,
    role: role || 'Stakeholder',
    message,
    type: type || 'Manual Notification',
    status: 'Sent' as const
  };

  whatsappLogs.unshift(newLog);
  return res.json({ success: true, log: newLog });
});

// Serve frontend assets in production build
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback all other routes to index.html for SPA architecture support
app.get('*', (_req, res, next) => {
  if (_req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start listening exclusively on hardcoded Port 3000 if not on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`DeveloperPro ERP Production Dev-Server is online on http://localhost:${PORT}`);
  });
}

export default app;
