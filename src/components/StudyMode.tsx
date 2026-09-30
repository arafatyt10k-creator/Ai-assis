import React, { useState, useRef, useEffect } from "react";
import { 
  BookOpen, 
  Sparkles, 
  PenTool, 
  Eraser, 
  RotateCcw, 
  Download, 
  Layers, 
  X,
  Lightbulb,
  Check,
  Flame,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { getBackendBaseUrl } from "../lib/audio";

interface StudyModeProps {
  onClose?: () => void;
}

interface StepItem {
  stepNumber: number;
  title: string;
  explanation: string;
  whiteboardNotes: string;
  keyConcept: string;
}

interface Flashcard {
  front: string;
  back: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const StudyMode: React.FC<StudyModeProps> = ({ onClose }) => {
  const [topicInput, setTopicInput] = useState<string>("Neural Networks & Backpropagation");
  const [selectedSubject, setSelectedSubject] = useState<string>("Computer Science");
  const [activeTab, setActiveTab] = useState<"lesson" | "whiteboard" | "flashcards" | "quiz">("lesson");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [studyPlan, setStudyPlan] = useState<{
    topic: string;
    subject: string;
    summary: string;
    steps: StepItem[];
    flashcards: Flashcard[];
    quiz: QuizQuestion[];
  }>({
    topic: "Neural Networks & Backpropagation",
    subject: "Computer Science",
    summary: "How deep learning algorithms calculate gradients using the chain rule to minimize loss.",
    steps: [
      {
        stepNumber: 1,
        title: "Forward Propagation",
        explanation: "Input vectors x are multiplied by weight matrices W, added with bias b, and passed through activation functions (ReLU, Sigmoid).",
        whiteboardNotes: "z = W · x + b\na = σ(z)",
        keyConcept: "Linear transformation followed by non-linear activation."
      },
      {
        stepNumber: 2,
        title: "Loss Function Calculation",
        explanation: "The model compares its prediction ŷ against the ground truth y using Mean Squared Error (MSE) or Cross-Entropy loss.",
        whiteboardNotes: "Loss L = ½ (y - ŷ)²",
        keyConcept: "Quantifying model error into a scalar cost."
      },
      {
        stepNumber: 3,
        title: "Backpropagation & Chain Rule",
        explanation: "Using the multivariable calculus chain rule, the algorithm computes partial derivatives ∂L/∂W backwards through layers.",
        whiteboardNotes: "∂L/∂W = (∂L/∂a) · (∂a/∂z) · (∂z/∂W)",
        keyConcept: "Gradient descent guides weight adjustment in opposite direction of gradient."
      }
    ],
    flashcards: [
      { front: "What is the purpose of an activation function?", back: "To introduce non-linearity, allowing neural nets to learn complex patterns." },
      { front: "What is Backpropagation?", back: "An algorithm that computes the gradient of the loss function with respect to weights using the chain rule." },
      { front: "What is Learning Rate (η)?", back: "A hyperparameter determining step size toward the loss minimum during gradient descent." }
    ],
    quiz: [
      {
        question: "Which mathematical rule powers the backpropagation algorithm?",
        options: ["Chain Rule", "Product Rule", "L'Hôpital's Rule", "Bayes' Theorem"],
        correctIndex: 0,
        explanation: "The chain rule allows calculating derivatives of composite functions through nested neural network layers."
      }
    ]
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState<string>("#22d3ee");
  const [brushSize, setBrushSize] = useState<number>(3);
  const [isEraser, setIsEraser] = useState(false);

  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = 420;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.strokeStyle = isEraser ? "#060d1f" : drawColor;
    ctx.lineWidth = isEraser ? brushSize * 4 : brushSize;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleGenerate = async () => {
    if (!topicInput.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const baseUrl = getBackendBaseUrl();
      const res = await fetch(`${baseUrl}/api/study-generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicInput,
          subject: selectedSubject,
          type: "lesson"
        })
      });
      if (!res.ok) {
        throw new Error("Failed to generate study module");
      }
      const data = await res.json();
      setStudyPlan(data);
      setCurrentCardIdx(0);
      setIsFlipped(false);
      setSelectedAnswers({});
      setShowQuizResults(false);
    } catch (err) {
      console.error("Study generation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const exportNotes = () => {
    const md = `# ${studyPlan.topic} (${studyPlan.subject})\n\n${studyPlan.summary}\n\n## Step-by-Step Breakdown\n` +
      studyPlan.steps.map(s => `### Step ${s.stepNumber}: ${s.title}\n${s.explanation}\n*Key Concept:* ${s.keyConcept}\n`).join("\n\n");
    
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${studyPlan.topic.toLowerCase().replace(/\s+/g, "_")}_notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040814] text-white flex flex-col justify-between overflow-hidden">
      <header className="p-4 flex items-center justify-between border-b border-sky-900/30 bg-[#061026]/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold font-display tracking-wide">Maya Study Hub</h2>
            <p className="text-[11px] font-mono text-purple-300/70">Interactive Lessons & Digital Whiteboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportNotes}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            title="Download Notes"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export Notes</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      <div className="p-3 bg-[#050c1c] border-b border-white/5 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex-1 min-w-[240px] flex items-center gap-2 bg-[#081533] border border-cyan-500/30 rounded-xl px-3 py-1.5">
          <Sparkles size={16} className="text-cyan-400" />
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="Enter any topic (e.g. Calculus, Photosynthesis, Rust, History)..."
            className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none font-sans"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-[#081533] border border-white/10 text-xs text-cyan-300 rounded-xl px-2.5 py-2 font-mono focus:outline-none"
          >
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Biology & Medicine">Biology & Medicine</option>
            <option value="History & Philosophy">History & Philosophy</option>
            <option value="Economics">Economics</option>
          </select>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 text-white font-bold rounded-xl text-xs font-mono shadow-[0_0_15px_rgba(168,85,247,0.3)] transition flex items-center gap-1.5 shrink-0"
          >
            {isLoading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={13} />}
            <span>{isLoading ? "Generating..." : "Generate Lesson"}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 px-4 py-2 bg-[#050e24] border-b border-white/5 z-20">
        {[
          { id: "lesson", label: "Step-by-Step Lesson", icon: Layers },
          { id: "whiteboard", label: "Digital Whiteboard", icon: PenTool },
          { id: "flashcards", label: "Flashcards", icon: Flame },
          { id: "quiz", label: "Knowledge Quiz", icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition cursor-pointer ${
                isActive
                  ? "bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        {activeTab === "lesson" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#081533] border border-cyan-500/20 shadow-xl">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                {studyPlan.subject}
              </span>
              <h2 className="text-xl font-bold font-display text-white mt-1">{studyPlan.topic}</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{studyPlan.summary}</p>
            </div>

            <div className="space-y-3">
              {studyPlan.steps.map((step) => (
                <div 
                  key={step.stepNumber}
                  className="p-4 rounded-2xl bg-[#061026] border border-white/10 hover:border-cyan-500/30 transition shadow-lg"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center border border-cyan-400/40">
                      {step.stepNumber}
                    </span>
                    <h3 className="text-sm font-bold font-display text-white">{step.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                    {step.explanation}
                  </p>
                  {step.whiteboardNotes && (
                    <div className="p-2.5 rounded-xl bg-[#040914] border border-cyan-500/20 font-mono text-xs text-cyan-300 flex items-start gap-2">
                      <Lightbulb size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <div className="whitespace-pre-line">{step.whiteboardNotes}</div>
                    </div>
                  )}
                  <div className="mt-2 text-[11px] font-sans text-purple-300/90 italic">
                    💡 Key takeaway: {step.keyConcept}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "whiteboard" && (
          <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between p-2 rounded-2xl bg-[#061026] border border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEraser(false)}
                  className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition ${
                    !isEraser ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <PenTool size={14} />
                  <span>Pen</span>
                </button>
                <button
                  onClick={() => setIsEraser(true)}
                  className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition ${
                    isEraser ? "bg-purple-500/20 text-purple-300 border border-purple-400/40" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Eraser size={14} />
                  <span>Eraser</span>
                </button>
                <div className="h-4 w-[1px] bg-white/10 mx-1" />
                {["#22d3ee", "#e879f9", "#fbbf24", "#34d399", "#ffffff"].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setDrawColor(c);
                      setIsEraser(false);
                    }}
                    className={`w-5 h-5 rounded-full transition transform ${drawColor === c && !isEraser ? "scale-125 ring-2 ring-white" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                onClick={clearCanvas}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-center gap-1 transition"
              >
                <RotateCcw size={13} />
                <span>Clear</span>
              </button>
            </div>

            <div className="relative flex-1 min-h-[380px] rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#060d1f] shadow-2xl flex items-center justify-center">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair touch-none"
              />
            </div>
          </div>
        )}

        {activeTab === "flashcards" && (
          <div className="flex flex-col items-center justify-center py-6">
            {studyPlan.flashcards.length > 0 ? (
              <div className="w-full max-w-md flex flex-col items-center gap-4">
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full aspect-[16/10] rounded-3xl p-6 bg-gradient-to-br from-[#081533] to-[#0d1f4d] border-2 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all hover:scale-[1.02]"
                >
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest mb-3">
                    {isFlipped ? "Answer" : "Question"} (Card {currentCardIdx + 1} of {studyPlan.flashcards.length})
                  </span>
                  
                  <p className="text-base sm:text-lg font-display text-white leading-relaxed">
                    {isFlipped 
                      ? studyPlan.flashcards[currentCardIdx].back 
                      : studyPlan.flashcards[currentCardIdx].front}
                  </p>
                  <span className="mt-4 text-[10px] font-mono text-slate-500">
                    Tap to flip
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIdx((prev) => Math.max(0, prev - 1));
                    }}
                    disabled={currentCardIdx === 0}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-xs font-mono text-cyan-300">
                    {currentCardIdx + 1} / {studyPlan.flashcards.length}
                  </span>
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIdx((prev) => Math.min(studyPlan.flashcards.length - 1, prev + 1));
                    }}
                    disabled={currentCardIdx === studyPlan.flashcards.length - 1}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No flashcards available for this topic.</p>
            )}
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="space-y-4 max-w-2xl mx-auto">
            {studyPlan.quiz.map((q, qIdx) => (
              <div key={qIdx} className="p-4 rounded-2xl bg-[#081533] border border-white/10 shadow-lg">
                <h4 className="text-sm font-bold font-display text-white mb-3">
                  {qIdx + 1}. {q.question}
                </h4>
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[qIdx] === optIdx;
                    const isCorrect = q.correctIndex === optIdx;
                    let btnStyle = "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10";
                    if (showQuizResults) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_#10b981]";
                      } else if (isSelected && !isCorrect) {
                        btnStyle = "bg-rose-500/20 border-rose-400 text-rose-300";
                      }
                    } else if (isSelected) {
                      btnStyle = "bg-cyan-500/20 border-cyan-400 text-cyan-300";
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-sans transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {showQuizResults && isCorrect && <Check size={14} className="text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {showQuizResults && (
                  <div className="mt-3 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs font-sans text-cyan-200">
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            ))}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setShowQuizResults(!showQuizResults)}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.4)] transition cursor-pointer"
              >
                {showQuizResults ? "Reset Answers" : "Check Quiz Results"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
