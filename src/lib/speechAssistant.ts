/**
 * Speech Assistant Engine
 * Manages client-side Web Speech Recognition and Web Speech Synthesis
 * with interruption handling, voice selection, speech rate, and event callbacks.
 */

export interface SpeechConfig {
  voiceName: string;
  rate: number;
  pitch: number;
  lang: string;
}

export class SpeechAssistant {
  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private config: SpeechConfig = {
    voiceName: "Google UK English Female",
    rate: 1.0,
    pitch: 1.05,
    lang: "en-US"
  };

  public onTranscript?: (text: string, isFinal: boolean) => void;
  public onStateChange?: (state: "idle" | "listening" | "processing" | "speaking") => void;
  public onError?: (error: string) => void;

  constructor(config?: Partial<SpeechConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.initRecognition();
  }

  private initRecognition() {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      console.warn("[SpeechAssistant] Web Speech Recognition not supported.");
      return;
    }

    try {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.config.lang;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStateChange?.("listening");
      };

      this.recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const transcript = final || interim;
        if (transcript && this.onTranscript) {
          this.onTranscript(transcript, Boolean(final));
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn("[SpeechAssistant Recognition Error]:", event.error);
        this.isListening = false;
        if (event.error !== "no-speech" && event.error !== "aborted") {
          this.onError?.(`Speech recognition error: ${event.error}`);
        }
        this.onStateChange?.("idle");
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (!this.isSpeaking) {
          this.onStateChange?.("idle");
        }
      };
    } catch (err: any) {
      console.error("[SpeechAssistant Init Error]:", err);
    }
  }

  public updateConfig(newConfig: Partial<SpeechConfig>) {
    this.config = { ...this.config, ...newConfig };
    if (this.recognition && newConfig.lang) {
      this.recognition.lang = newConfig.lang;
    }
  }

  public startListening() {
    this.stopSpeaking();
    if (!this.recognition) {
      this.initRecognition();
    }
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (err: any) {
        console.warn("[SpeechAssistant] Could not start recognition:", err);
      }
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {}
      this.isListening = false;
    }
  }

  public speak(text: string, onDone?: () => void) {
    if (!("speechSynthesis" in window)) {
      console.warn("[SpeechAssistant] Speech synthesis not supported.");
      onDone?.();
      return;
    }

    this.stopSpeaking();
    this.isSpeaking = true;
    this.onStateChange?.("speaking");

    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/#+\s/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = this.config.rate;
    utterance.pitch = this.config.pitch;
    utterance.lang = this.config.lang;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const match = voices.find(v => v.name.includes(this.config.voiceName) || (v.lang === this.config.lang && v.name.includes("Female")));
      if (match) {
        utterance.voice = match;
      }
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      this.onStateChange?.("idle");
      onDone?.();
    };

    utterance.onerror = (err) => {
      console.warn("[SpeechSynthesis Error]:", err);
      this.isSpeaking = false;
      this.onStateChange?.("idle");
      onDone?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if ("speechSynthesis" in window) {
      return window.speechSynthesis.getVoices();
    }
    return [];
  }
}
