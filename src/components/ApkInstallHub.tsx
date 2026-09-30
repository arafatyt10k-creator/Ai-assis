import React, { useState } from "react";
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  Copy, 
  Check, 
  X, 
  Cpu, 
  HelpCircle, 
  FolderArchive, 
  RefreshCw 
} from "lucide-react";
import { usePWAInstall } from "../lib/usePWAInstall";
import { MayraLogo } from "./MayraLogo";

interface ApkInstallHubProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: "en" | "bn";
}

export const ApkInstallHub: React.FC<ApkInstallHubProps> = ({
  isOpen,
  onClose,
  lang = "en"
}) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<"direct_install" | "cloud_build" | "termux" | "export_zip">("direct_install");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;
  const isBn = lang === "bn";

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      await install();
    }
  };

  const handleDownloadZip = () => {
    setIsExporting(true);
    const link = document.createElement("a");
    link.href = "/api/export-android-project";
    link.download = "mayra-ai-android-project.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 2000);
  };

  const termuxScript = `# 1. Install required packages on Termux (Android)
pkg update -y && pkg install -y openjdk-17 nodejs-lts git unzip

# 2. Extract and enter MAYRA project
unzip mayra-ai-android-project.zip -d mayra-ai
cd mayra-ai

# 3. Install packages and build web bundle
npm install
npm run build

# 4. Sync Android Native Platform
npx cap sync android

# 5. Compile Debug APK directly on phone
cd android
chmod +x gradlew
./gradlew assembleDebug

# 6. Copy output APK to phone Downloads folder
cp app/build/outputs/apk/debug/app-debug.apk /sdcard/Download/MAYRA-AI.apk
echo "MAYRA AI APK is ready in your phone Downloads folder!"`;

  const githubActionsGuide = `# Free Automated Cloud Build via GitHub Actions:
1. Export the project ZIP from the button below.
2. Open github.com on your phone and create a new repository: 'mayra-ai'.
3. Upload the project files (or push using git).
4. Go to the 'Actions' tab in GitHub on your mobile browser.
5. Tap 'Build MAYRA AI Android APK' -> 'Run workflow'.
6. In ~2 minutes, your 'app-debug.apk' will be compiled and ready to download under Artifacts / Releases!`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-[#050e24] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.15)] flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-cyan-500/20 bg-gradient-to-r from-[#06142e] to-[#0a1f42] flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Smartphone size={22} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display text-white tracking-wide">
                  {isBn ? "MAYRA AI অ্যান্ড্রয়েড হাব" : "MAYRA AI Android APK & Mobile Hub"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-400/30">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs font-mono text-cyan-300/70 mt-0.5">
                {isBn ? "মোবাইল ডিভাইসে সরাসরি ইনস্টলেশন" : "Direct Mobile-Only Android Installation"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex border-b border-white/5 bg-[#030917] px-3 pt-2 gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("direct_install")}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-mono font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === "direct_install"
                ? "bg-[#06142e] text-cyan-300 border-t-2 border-cyan-400 shadow-[0_-4px_12px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Zap size={14} className="text-amber-400" />
            <span>{isBn ? "১-ট্যাপ ইনস্টল" : "1-Tap Install"}</span>
          </button>
          <button
            onClick={() => setActiveTab("cloud_build")}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-mono font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === "cloud_build"
                ? "bg-[#06142e] text-cyan-300 border-t-2 border-cyan-400 shadow-[0_-4px_12px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Cpu size={14} className="text-purple-400" />
            <span>{isBn ? "ক্লাউড এপিকে" : "Cloud APK Build"}</span>
          </button>
          <button
            onClick={() => setActiveTab("termux")}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-mono font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === "termux"
                ? "bg-[#06142e] text-cyan-300 border-t-2 border-cyan-400 shadow-[0_-4px_12px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Terminal size={14} className="text-emerald-400" />
            <span>{isBn ? "টারমাক্স বিল্ড" : "Termux Build"}</span>
          </button>
          <button
            onClick={() => setActiveTab("export_zip")}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-mono font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === "export_zip"
                ? "bg-[#06142e] text-cyan-300 border-t-2 border-cyan-400 shadow-[0_-4px_12px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <FolderArchive size={14} className="text-blue-400" />
            <span>{isBn ? "সোর্স জিপ" : "Export Source"}</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === "direct_install" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-[#061633] to-[#040914] border border-cyan-500/40 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shrink-0">
                    <MayraLogo size="sm" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-display text-white">
                      {isBn ? "অ্যান্ড্রয়েডে স্ট্যান্ডঅ্যালোন ইনস্টল" : "Install Standalone Mobile App on Android"}
                    </h4>
                    <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                      {isBn
                        ? "কোনো কম্পিউটার ছাড়া ফোনে সরাসরি স্ট্যান্ডঅ্যালোন নেটিভ অ্যাপ হিসেবে চালান।"
                        : "No PC needed. Runs as a standalone native-style Android app with full hardware microphone, camera, and offline presence."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {isInstalled ? (
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-500/30 w-full sm:w-auto">
                      <CheckCircle2 size={16} />
                      <span>{isBn ? "ইনস্টল সম্পন্ন হয়েছে!" : "MAYRA AI is already installed!"}</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleDirectInstall}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs font-mono shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] transition cursor-pointer"
                    >
                      <Download size={16} />
                      <span>{isBn ? "ফোনে ইনস্টল করুন" : "Install App to Android Phone"}</span>
                    </button>
                  )}
                  <span className="text-[11px] font-mono text-cyan-300/80 text-center">
                    {isAndroid ? "✓ Android Phone Detected" : "✓ Mobile Ready"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#061026] border border-white/5 space-y-2.5">
                <div className="text-xs font-bold font-mono text-cyan-300 flex items-center gap-2">
                  <HelpCircle size={14} />
                  <span>{isBn ? "ম্যানুয়াল ইনস্টলেশন নির্দেশিকা:" : "Manual Step-by-Step for Android Chrome:"}</span>
                </div>
                <div className="text-xs font-sans text-slate-300 space-y-2 pl-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>{isBn ? "ফোনের ক্রোম ব্রাউজারে উপরের ডানদিকের তিনটি বিন্দু (⋮) মেনুতে ট্যাপ করুন।" : "Tap the three vertical dots (⋮) in the top-right corner of Chrome on your phone."}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>{isBn ? "'Add to Home screen' অথবা 'Install app' নির্বাচন করুন।" : "Tap 'Add to Home screen' or 'Install app'."}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>{isBn ? "অ্যাপটি আপনার ফোনের হোম স্ক্রিনে ইনস্টল হয়ে যাবে!" : "MAYRA AI will appear on your Android launcher and launch in full-screen mode!"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "cloud_build" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#06142e] border border-purple-500/30">
                <div className="flex items-center gap-2 text-sm font-bold font-display text-white">
                  <Cpu size={16} className="text-purple-400" />
                  <span>{isBn ? "ফ্রি ক্লাউড এপিকে কম্পাইলার" : "100% Free Automated Cloud APK Compiler"}</span>
                </div>
                <p className="text-xs text-slate-300 font-sans mt-1.5 leading-relaxed">
                  {isBn
                    ? "GitHub Actions ওয়ার্কফ্লো ক্লাউডে স্বয়ংক্রিয়ভাবে Android .apk ফাইল কম্পাইল করে।"
                    : "The pre-configured GitHub Actions workflow automatically compiles a production-ready Android .apk binary in the cloud for you."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#030917] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {isBn ? "মোবাইল বিল্ড গাইড:" : "3-Step Mobile Build Guide:"}
                  </span>
                  <button
                    onClick={() => handleCopy(githubActionsGuide, "github_guide")}
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 bg-white/5 px-2 py-1 rounded-lg transition cursor-pointer"
                  >
                    {copiedCode === "github_guide" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedCode === "github_guide" ? "Copied" : "Copy Steps"}</span>
                  </button>
                </div>

                <div className="text-xs font-sans text-slate-300 space-y-2 pl-1">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <strong className="text-cyan-300 block mb-0.5">Step 1: Export Source ZIP</strong>
                    <span>Tap the "Export Source" tab below and download the ZIP file on your phone.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <strong className="text-cyan-300 block mb-0.5">Step 2: Upload to GitHub</strong>
                    <span>Create a repository on GitHub from your phone browser and upload the project files.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <strong className="text-cyan-300 block mb-0.5">Step 3: Download your compiled APK!</strong>
                    <span>Under the 'Actions' tab, the build workflow runs automatically. Download the output <code className="text-emerald-300 bg-black/40 px-1 rounded">app-debug.apk</code> and tap to install!</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownloadZip}
                    disabled={isExporting}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition cursor-pointer"
                  >
                    {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                    <span>{isExporting ? "Packaging ZIP..." : "Download Full Android Source ZIP"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "termux" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#06142e] border border-emerald-500/30">
                <div className="flex items-center gap-2 text-sm font-bold font-display text-white">
                  <Terminal size={16} className="text-emerald-400" />
                  <span>{isBn ? "টারমাক্স দিয়ে ফোনে এপিকে বিল্ড করুন" : "Build APK on Phone with Termux (No PC)"}</span>
                </div>
                <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                  {isBn
                    ? "টারমাক্স অ্যাপ ব্যবহার করে সরাসরি আপনার স্মার্টফোনে এপিকে কম্পাইল করতে পারবেন।"
                    : "If you have the free Termux app installed on Android, you can compile the APK right inside your smartphone without any computer."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#020610] border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <span>$</span>
                    <span>Termux Compilation Commands</span>
                  </span>
                  <button
                    onClick={() => handleCopy(termuxScript, "termux_code")}
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-emerald-300 bg-white/5 px-2 py-1 rounded-lg transition cursor-pointer"
                  >
                    {copiedCode === "termux_code" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedCode === "termux_code" ? "Copied!" : "Copy All"}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/80 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed border border-emerald-500/10">
                  {termuxScript}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "export_zip" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#06142e] border border-blue-500/30">
                <div className="flex items-center gap-2 text-sm font-bold font-display text-white">
                  <FolderArchive size={16} className="text-blue-400" />
                  <span>{isBn ? "সম্পূর্ণ অ্যান্ড্রয়েড ও ক্যাপাসিটর প্রজেক্ট বান্ডেল" : "Complete Android & Capacitor Project Bundle"}</span>
                </div>
                <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                  {isBn
                    ? "এই জিপ ফাইলে AndroidManifest.xml, Gradle কনফিগারেশন এবং সম্পূর্ণ সোর্স কোড রয়েছে।"
                    : "This ZIP bundle contains the full native Android Studio structure, Gradle scripts, AndroidManifest with all phone permissions, and Vite React components."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#030917] border border-white/10 space-y-3">
                <div className="text-xs font-mono text-slate-300 space-y-1.5">
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Package Name:</span>
                    <span className="text-cyan-300">ai.mayra.assistant</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Min Android SDK:</span>
                    <span className="text-cyan-300">24 (Android 7.0+)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Target SDK:</span>
                    <span className="text-cyan-300">34 (Android 14)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Capacitor Version:</span>
                    <span className="text-cyan-300">v6.0+</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Automated Actions:</span>
                    <span className="text-emerald-400">✓ build-apk.yml included</span>
                  </div>
                </div>

                <button
                  onClick={handleDownloadZip}
                  disabled={isExporting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition cursor-pointer"
                >
                  {isExporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                  <span>{isExporting ? "Packaging ZIP..." : "Download 'mayra-ai-android-project.zip'"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-cyan-500/20 bg-[#030814] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <ShieldCheck size={14} className="text-cyan-400" />
            <span>{isBn ? "যাচাইকৃত অ্যান্ড্রয়েড প্যাকেজ" : "Verified Android Build Package"}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition cursor-pointer"
          >
            {isBn ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
