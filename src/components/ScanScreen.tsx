import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  QrCode, 
  FileText, 
  Calculator, 
  Sparkles, 
  X, 
  Flashlight, 
  RotateCcw, 
  Upload, 
  CheckCircle2, 
  Copy,
  ArrowRight,
  Video,
  Square,
  Image as ImageIcon
} from "lucide-react";
import { actionExecutor } from "../lib/actionExecutor";
import { getBackendBaseUrl } from "../lib/audio";

interface ScanScreenProps {
  onClose?: () => void;
  onSendToChat?: (text: string, imageBase64?: string) => void;
  lang?: "en" | "bn";
}

export const ScanScreen: React.FC<ScanScreenProps> = ({
  onClose,
  onSendToChat,
  lang = "en"
}) => {
  const isBn = lang === "bn";
  const [activeMode, setActiveMode] = useState<"camera_photo" | "camera_video" | "qr" | "document" | "math" | "gallery">("camera_photo");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async (facing: "environment" | "user" = facingMode) => {
    setErrorMessage(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Camera stream error:", err);
      setErrorMessage(
        err.name === "NotAllowedError"
          ? (isBn ? "ক্যামেরা পারমিশন ডিনাই হয়েছে। অনুগ্রহ করে ব্রাউজার বা অ্যাপ সেটিংসে অনুমতি দিন।" : "Camera permission was declined. Please allow camera access in settings.")
          : `Camera error: ${err.message || "Unable to access camera"}`
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => stopCamera();
  }, [facingMode]);

  const flipCamera = () => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      const capabilities = (track.getCapabilities?.() as any) || {};
      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !torchOn } as any]
          });
          setTorchOn(!torchOn);
        } catch (e) {
          setTorchOn(!torchOn);
        }
      } else {
        setTorchOn(!torchOn);
      }
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const base64 = dataUrl.split(",")[1];
    setCapturedImage(dataUrl);

    canvas.toBlob((blob) => {
      if (blob) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `MAYRA_PHOTO_${timestamp}.jpg`;
        actionExecutor.saveMediaFile(blob, filename, false);
        setSavedNotice(isBn ? `ছবি সংরক্ষিত হয়েছে: ${filename}` : `Photo saved to device: ${filename}`);
        setTimeout(() => setSavedNotice(null), 3000);
      }
    }, "image/jpeg", 0.9);

    if (["qr", "document", "math"].includes(activeMode)) {
      analyzeImage(base64);
    }
  };

  const startVideoRecording = () => {
    if (!streamRef.current) return;
    try {
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `MAYRA_VIDEO_${timestamp}.webm`;
        actionExecutor.saveMediaFile(blob, filename, true);
        setSavedNotice(isBn ? `ভিডিও সংরক্ষিত হয়েছে: ${filename}` : `Video saved to device: ${filename}`);
        setTimeout(() => setSavedNotice(null), 3500);
      };
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (e: any) {
      console.error("Recording error:", e);
      setErrorMessage("Video recording unsupported in this browser mode.");
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      setCapturedImage(dataUrl);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setErrorMessage(null);
    let modeParam = "general";
    if (activeMode === "qr") modeParam = "qr";
    else if (activeMode === "document") modeParam = "document";
    else if (activeMode === "math") modeParam = "math";

    try {
      const baseUrl = getBackendBaseUrl();
      const res = await fetch(`${baseUrl}/api/vision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mode: modeParam,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }
      const data = await res.json();
      setAnalysisResult(data.analysis || "No details found in image.");
    } catch (err: any) {
      console.error("Vision Analysis failed:", err);
      setErrorMessage(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyResult = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040814] text-white flex flex-col justify-between overflow-hidden select-none font-mono">
      <header className="p-4 flex items-center justify-between border-b border-sky-900/30 bg-[#061026]/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
          <div>
            <h2 className="text-base font-bold font-display tracking-wide text-white">
              {isBn ? "স্ক্যানার" : "Scanner"}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTorch}
            className={`p-2 rounded-xl border transition ${
              torchOn ? "bg-amber-500/20 border-amber-400 text-amber-300" : "bg-white/5 border-white/10 text-slate-300"
            }`}
            title="Torch"
          >
            <Flashlight size={16} />
          </button>
          <div className="w-8 h-8 rounded-xl bg-[#081533] border border-cyan-400/40 p-0.5 flex items-center justify-center">
            <span className="font-display font-black text-cyan-400 text-xs">M</span>
          </div>
        </div>
      </header>

      <div className="px-4 py-2 flex items-center justify-between text-[11px] text-cyan-300 bg-[#050c1c] border-b border-white/5 z-20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold tracking-wider">MAYRA VISION</span>
          <span className="text-slate-400 hidden sm:inline">&gt; STANDBY • start a session to give Maya eyes •</span>
        </div>
        <div 
          onClick={flipCamera}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#081533] border border-cyan-500/30 text-cyan-300 text-[10px] cursor-pointer hover:border-cyan-400"
        >
          <span>{facingMode === "environment" ? "BACK CAM" : "FRONT CAM"}</span>
          <RotateCcw size={11} />
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-3 overflow-hidden bg-black">
        {!capturedImage ? (
          <div className="relative w-full h-full rounded-3xl overflow-hidden border border-cyan-500/30 flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-cyan-500/40 border-dashed flex items-center justify-center animate-[spin_30s_linear_infinite]">
                <div className="w-48 h-48 rounded-full border-2 border-cyan-400/60 border-t-transparent border-b-transparent animate-[spin_15s_linear_infinite_reverse]" />
                <div className="w-32 h-32 rounded-full border border-blue-400/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-[1px] bg-cyan-400/80" />
                  <div className="h-8 w-[1px] bg-cyan-400/80" />
                </div>
              </div>
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400/70" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400/70" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400/70" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400/70" />
            </div>

            {isRecording && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-rose-600/90 border border-rose-400 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-[0_0_15px_#f43f5e] animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span>REC {formatTimer(recordingSeconds)}</span>
              </div>
            )}

            {savedNotice && (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-xs font-sans flex items-center gap-2 shadow-2xl z-30">
                <CheckCircle2 size={16} />
                <span>{savedNotice}</span>
              </div>
            )}

            {errorMessage && (
              <div className="absolute bottom-6 left-4 right-4 p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs text-center z-20">
                {errorMessage}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full max-w-lg flex flex-col gap-3 overflow-y-auto z-20">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-cyan-500/40 bg-black shadow-2xl shrink-0">
              <img src={capturedImage} alt="Snapshot" className="w-full h-full object-cover" />
              <button
                onClick={() => {
                  setCapturedImage(null);
                  setAnalysisResult(null);
                  startCamera(facingMode);
                }}
                className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/15 text-xs font-mono flex items-center gap-1 text-slate-200 hover:text-white"
              >
                <RotateCcw size={12} />
                <span>Retake</span>
              </button>
            </div>

            <div className="flex-1 p-4 rounded-2xl bg-[#061026] border border-cyan-500/30 shadow-xl overflow-y-auto flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-cyan-400 animate-pulse" size={16} />
                    <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
                      Vision Analysis
                    </span>
                  </div>
                  {analysisResult && (
                    <button
                      onClick={copyResult}
                      className="text-xs font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>

                {isAnalyzing ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-3">
                    <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-mono text-cyan-300/80">Gemini 2.5 Vision processing...</p>
                  </div>
                ) : analysisResult ? (
                  <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                    {analysisResult}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Captured and saved to device.</p>
                )}
              </div>

              {analysisResult && onSendToChat && (
                <button
                  onClick={() => onSendToChat(`[Vision Analysis]:\n${analysisResult}`, capturedImage || undefined)}
                  className="mt-3 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition cursor-pointer"
                >
                  <span>Discuss in Chat</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-1.5 flex items-center justify-between text-[10px] text-cyan-400/80 bg-[#030814] border-t border-white/5">
        <span>FRM 004301 • SIG DD</span>
        <span>{cameraActive ? "AI-FEED LIVE" : "AI-FEED OFFLINE"}</span>
      </div>

      <div className="flex items-center justify-center gap-2 px-3 py-2 bg-[#040a1c] border-t border-white/5 overflow-x-auto z-20">
        {[
          { id: "camera_photo", label: isBn ? "ছবি" : "Photo", icon: Camera },
          { id: "camera_video", label: isBn ? "ভিডিও" : "Video", icon: Video },
          { id: "qr", label: "QR / Barcode", icon: QrCode },
          { id: "document", label: "OCR Doc", icon: FileText },
          { id: "math", label: "Math", icon: Calculator },
        ].map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono transition cursor-pointer shrink-0 ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={13} />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      <footer className="p-4 bg-[#050c1c] border-t border-sky-900/30 flex items-center justify-between max-w-md mx-auto w-full z-20">
        <div className="relative p-1">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-400" />
          <button
            onClick={flipCamera}
            className="px-3 py-2 text-cyan-300 hover:text-white flex flex-col items-center gap-1 cursor-pointer transition"
          >
            <RotateCcw size={18} />
            <span className="text-[9px] tracking-widest uppercase">FLIP</span>
          </button>
        </div>

        <div className="relative">
          <div className="absolute -inset-2 rounded-full bg-cyan-500/20 blur-md animate-pulse pointer-events-none" />
          <button
            onClick={() => {
              if (activeMode === "camera_video") {
                if (isRecording) stopVideoRecording();
                else startVideoRecording();
              } else {
                handleCapturePhoto();
              }
            }}
            className={`w-18 h-18 rounded-full border-4 flex items-center justify-center transition-all cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.5)] ${
              isRecording
                ? "bg-rose-600 border-rose-400 text-white animate-pulse"
                : "bg-gradient-to-tr from-blue-600 to-cyan-400 border-cyan-300 text-slate-950 hover:scale-105 active:scale-95"
            }`}
          >
            {isRecording ? (
              <Square size={20} className="fill-white" />
            ) : activeMode === "camera_video" ? (
              <Video size={22} className="text-slate-950" />
            ) : (
              <Camera size={22} className="text-slate-950" />
            )}
          </button>
        </div>

        <div className="relative p-1">
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-400" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400" />
          
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 text-cyan-300 hover:text-white flex flex-col items-center gap-1 cursor-pointer transition"
            title="Upload from Gallery"
          >
            <ImageIcon size={18} />
            <span className="text-[9px] tracking-widest uppercase">GALLERY</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
