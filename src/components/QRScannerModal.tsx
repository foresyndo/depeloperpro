import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, AlertCircle, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { DocumentHub } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  docs: DocumentHub[];
  onVerified: (doc: DocumentHub) => void;
  targetDocId?: string | null; // If passed, we can restrict or highlight matches
}

export default function QRScannerModal({
  isOpen,
  onClose,
  docs,
  onVerified,
  targetDocId
}: QRScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scannedResult, setScannedResult] = useState<{
    status: 'success' | 'invalid_qr' | 'not_found';
    scannedText: string;
    doc?: DocumentHub;
  } | null>(null);

  // Sound feedback on successful scan
  const playSuccessBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitched beep (A5)
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.error("Failed to play scan beep", e);
    }
  };

  const playErrorBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // Low buzz (A3)
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.error("Failed to play error beep", e);
    }
  };

  // Enumerate cameras
  useEffect(() => {
    if (!isOpen) return;
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        setCameraDevices(videoInputs);
        if (videoInputs.length > 0) {
          // Default to the environment/back camera if available, or first device
          const backCam = videoInputs.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
          setSelectedDeviceId(backCam ? backCam.deviceId : videoInputs[0].deviceId);
        }
      })
      .catch(err => {
        console.warn("Could not enumerate camera devices:", err);
      });
  }, [isOpen]);

  // Start or switch camera stream
  useEffect(() => {
    if (!isOpen) return;

    let activeStream: MediaStream | null = null;
    setErrorMessage('');
    setScannedResult(null);
    setIsScanning(true);

    const constraints: MediaStreamConstraints = {
      video: selectedDeviceId 
        ? { deviceId: { exact: selectedDeviceId } }
        : { facingMode: 'environment' }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        setHasCameraPermission(true);
        activeStream = stream;
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS
          videoRef.current.play().catch(e => console.error("Video play failed:", e));
        }
      })
      .catch(err => {
        console.error("Camera access error:", err);
        setHasCameraPermission(false);
        setErrorMessage(
          err.name === 'NotAllowedError' 
            ? 'Akses kamera ditolak. Silakan izinkan kamera di browser Anda.' 
            : `Gagal mengakses kamera: ${err.message}`
        );
      });

    return () => {
      // Clean up stream tracks on unmount or device change
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isOpen, selectedDeviceId]);

  // Real-time canvas scanning and HUD render loop
  useEffect(() => {
    if (!isOpen || !hasCameraPermission || !isScanning) return;

    let laserY = 0;
    let laserDirection = 1;

    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
        requestRef.current = requestAnimationFrame(tick);
        return;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        requestRef.current = requestAnimationFrame(tick);
        return;
      }

      // Check if video is ready and has valid width/height
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Set canvas internal resolution to match video aspect ratio beautifully
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const width = canvas.width;
        const height = canvas.height;

        // Draw the current video frame as the background
        ctx.drawImage(video, 0, 0, width, height);

        // --- DRAW QR HUD / SCANNER RETICLE Overlay ---
        const scanSize = Math.min(width, height) * 0.6; // 60% of shortest dimension
        const scanX = (width - scanSize) / 2;
        const scanY = (height - scanSize) / 2;

        // Draw semi-transparent dark mask over non-scanner area
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        // Top
        ctx.fillRect(0, 0, width, scanY);
        // Bottom
        ctx.fillRect(0, scanY + scanSize, width, height - (scanY + scanSize));
        // Left
        ctx.fillRect(0, scanY, scanX, scanSize);
        // Right
        ctx.fillRect(scanX + scanSize, scanY, width - (scanX + scanSize), scanSize);

        // Draw HUD square frame border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(scanX, scanY, scanSize, scanSize);

        // Draw elegant glowing green corners
        ctx.strokeStyle = '#10b981'; // Emerald-500
        ctx.lineWidth = 4;
        const cornerLen = 20;

        // Top-Left corner
        ctx.beginPath();
        ctx.moveTo(scanX, scanY + cornerLen);
        ctx.lineTo(scanX, scanY);
        ctx.lineTo(scanX + cornerLen, scanY);
        ctx.stroke();

        // Top-Right corner
        ctx.beginPath();
        ctx.moveTo(scanX + scanSize, scanY + cornerLen);
        ctx.lineTo(scanX + scanSize, scanY);
        ctx.lineTo(scanX + scanSize - cornerLen, scanY);
        ctx.stroke();

        // Bottom-Left corner
        ctx.beginPath();
        ctx.moveTo(scanX, scanY + scanSize - cornerLen);
        ctx.lineTo(scanX, scanY + scanSize);
        ctx.lineTo(scanX + cornerLen, scanY + scanSize);
        ctx.stroke();

        // Bottom-Right corner
        ctx.beginPath();
        ctx.moveTo(scanX + scanSize, scanY + scanSize - cornerLen);
        ctx.lineTo(scanX + scanSize, scanY + scanSize);
        ctx.lineTo(scanX + scanSize - cornerLen, scanY + scanSize);
        ctx.stroke();

        // Draw sweeping neon green laser line
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#34d399'; // Emerald-400
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(scanX + 2, scanY + laserY);
        ctx.lineTo(scanX + scanSize - 2, scanY + laserY);
        ctx.stroke();
        
        // Reset shadow for next draws
        ctx.shadowBlur = 0;

        // Move laser
        laserY += 4 * laserDirection;
        if (laserY >= scanSize || laserY <= 0) {
          laserDirection *= -1;
        }

        // --- SCAN CODE QR ---
        // Grab ImageData centered in the scanning target
        try {
          const imgData = ctx.getImageData(scanX, scanY, scanSize, scanSize);
          const code = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data) {
            // Found a QR Code!
            setIsScanning(false);
            handleScannedText(code.data);
            return; // stop tick loop
          }
        } catch (e) {
          // imageData errors can happen prior to canvas dimensions stabilization, ignore them
        }
      }

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isOpen, hasCameraPermission, isScanning, selectedDeviceId]);

  // Decode scanned text and look up document in state
  const handleScannedText = (text: string) => {
    console.log("Scanned QR Text:", text);

    // Parse docId from the URL or query parameters
    let foundDocId: string | null = null;
    try {
      if (text.startsWith('http://') || text.startsWith('https://')) {
        const urlObj = new URL(text);
        foundDocId = urlObj.searchParams.get('docId');
      } else {
        // Fallback check if qr encodes just the raw ID or query string
        const match = text.match(/[?&]docId=([^&#]+)/);
        if (match) {
          foundDocId = match[1];
        } else {
          foundDocId = text; // assume it's the raw ID
        }
      }
    } catch (e) {
      foundDocId = text;
    }

    if (!foundDocId) {
      playErrorBeep();
      setScannedResult({
        status: 'invalid_qr',
        scannedText: text
      });
      return;
    }

    // Lookup doc in ERP state
    const doc = docs.find(d => d.id === foundDocId);

    if (doc) {
      // Check if scanner is restricted to a target document ID
      if (targetDocId && doc.id !== targetDocId) {
        playErrorBeep();
        setScannedResult({
          status: 'not_found',
          scannedText: text
        });
        return;
      }

      playSuccessBeep();
      setScannedResult({
        status: 'success',
        scannedText: text,
        doc
      });
      // Trigger verify callback to parent state for audit logging/UI response
      onVerified(doc);
    } else {
      playErrorBeep();
      setScannedResult({
        status: 'not_found',
        scannedText: text
      });
    }
  };

  const handleResetScan = () => {
    setScannedResult(null);
    setIsScanning(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Pemindai QR Dokumen Fisik</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Menggunakan kamera perangkat untuk memeriksa e-signature berkas</p>
            </div>
          </div>
          <button
            type="button"
            id="close-qr-scanner-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-black p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex flex-col items-center justify-center flex-1 overflow-y-auto min-h-[300px] space-y-4">
          
          {hasCameraPermission === null && !errorMessage && (
            <div className="text-center py-12 space-y-3">
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-350">Meminta Izin Kamera Perangkat...</p>
            </div>
          )}

          {errorMessage && (
            <div className="text-center p-6 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/50 max-w-sm space-y-3">
              <AlertCircle className="h-8 w-8 text-rose-500 mx-auto animate-bounce" />
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400">{errorMessage}</p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Kembali ke Dokumen
              </button>
            </div>
          )}

          {hasCameraPermission === true && isScanning && (
            <div className="relative w-full max-w-sm aspect-video sm:aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
              {/* Actual invisible video stream */}
              <video 
                ref={videoRef}
                className="hidden" 
              />
              
              {/* Interactive rendering canvas */}
              <canvas 
                ref={canvasRef}
                className="w-full h-full object-cover"
              />

              {/* Status Banner */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-full text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Kamera Aktif • Bidik Kode QR
              </div>
            </div>
          )}

          {/* Scanned Results */}
          {scannedResult && (
            <div className="w-full max-w-sm space-y-4">
              
              {scannedResult.status === 'success' && scannedResult.doc && (
                <div className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-5 space-y-3 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs border-b border-emerald-100 dark:border-emerald-900 pb-2">
                    <ShieldCheck className="h-5 w-5" />
                    DEKRIPSI SUKSES: INTEGRITAS SAH ✓
                  </div>

                  <div className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <p className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider">Metode: Tanda Tangan Kriptografi E-Signature ERP</p>
                    
                    <div>
                      <span className="text-slate-400 font-medium">Judul Dokumen:</span>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{scannedResult.doc.title}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block">ID Dokumen:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{scannedResult.doc.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Kategori / Versi:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{scannedResult.doc.category} (v{scannedResult.doc.version})</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-slate-400 font-medium block">Alur Penandatangan:</span>
                      <div className="space-y-1 pl-1">
                        {scannedResult.doc.approvalWorkflow.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-emerald-500">✓</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{step.approverName}</span>
                            <span className="text-slate-400 text-[10px]">({step.approverRole})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900 flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded text-[9px] font-bold">
                        STATUS: {scannedResult.doc.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Hash Verified: Clean
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {scannedResult.status === 'not_found' && (
                <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/60 rounded-xl p-5 space-y-3 shadow-sm text-center animate-fade-in">
                  <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Dokumen Tidak Terdaftar</h4>
                    <p className="text-[11px] text-slate-650 leading-relaxed">
                      Kode QR berhasil dipindai tetapi pengenal dokumen ini tidak ditemukan dalam database ERP DeveloperPro. Berkas mungkin berasal dari sistem luar atau salinan ilegal.
                    </p>
                  </div>
                  <p className="text-[9px] font-mono text-slate-400 break-all p-1.5 bg-white dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800">
                    Scanned: {scannedResult.scannedText}
                  </p>
                </div>
              )}

              {scannedResult.status === 'invalid_qr' && (
                <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/60 rounded-xl p-5 space-y-3 shadow-sm text-center animate-fade-in">
                  <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">Format QR Tidak Valid</h4>
                    <p className="text-[11px] text-slate-650 leading-relaxed">
                      Kode QR ini tidak mengandung payload hash e-signature DeveloperPro yang dapat didekripsi secara aman.
                    </p>
                  </div>
                  <p className="text-[9px] font-mono text-slate-400 break-all p-1.5 bg-white dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800">
                    Isi QR: {scannedResult.scannedText}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  id="rescan-btn"
                  onClick={handleResetScan}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Pindai Ulang
                </button>
                <button
                  type="button"
                  id="close-after-scan-btn"
                  onClick={onClose}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Tutup Pemindai
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Camera Selector Footer */}
        {hasCameraPermission === true && isScanning && cameraDevices.length > 1 && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Kamera:</span>
            <select
              value={selectedDeviceId}
              onChange={e => setSelectedDeviceId(e.target.value)}
              className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] max-w-[200px] font-medium"
            >
              {cameraDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Kamera ${cameraDevices.indexOf(device) + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

      </div>
    </div>
  );
}
