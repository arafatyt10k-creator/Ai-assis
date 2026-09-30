/**
 * MAYRA Verified Action Execution Engine
 * Provides structured, verifiable, and safe execution for Android device actions,
 * app launchers, media playback, messaging intents, and internal navigation.
 */

export type ActionStatus = 
  | "pending" 
  | "awaiting_confirmation" 
  | "running" 
  | "succeeded" 
  | "failed" 
  | "cancelled" 
  | "unverified";

export type ActionCategory = 
  | "app_launcher" 
  | "media_playback" 
  | "communication" 
  | "system_control" 
  | "navigation" 
  | "camera" 
  | "memory";

export interface VerifiedAction {
  id: string;
  category: ActionCategory;
  name: string;
  description: string;
  target?: string;
  payload?: any;
  status: ActionStatus;
  requiresConfirmation: boolean;
  timestamp: string;
  resultMessage?: string;
  errorMessage?: string;
  isReversible?: boolean;
}

class ActionExecutorService {
  private listeners: ((actions: VerifiedAction[]) => void)[] = [];
  private activeActions: VerifiedAction[] = [];
  private actionHistory: VerifiedAction[] = [];

  constructor() {
    const saved = typeof window !== "undefined" ? localStorage.getItem("maya_action_history") : null;
    if (saved) {
      try {
        this.actionHistory = JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to parse action history:", e);
      }
    }
  }

  public subscribe(listener: (actions: VerifiedAction[]) => void) {
    this.listeners.push(listener);
    listener(this.actionHistory);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.actionHistory));
    if (typeof window !== "undefined") {
      localStorage.setItem("maya_action_history", JSON.stringify(this.actionHistory.slice(-50)));
    }
  }

  public getHistory(): VerifiedAction[] {
    return this.actionHistory;
  }

  public clearHistory() {
    this.actionHistory = [];
    this.notify();
  }

  public planAction(params: {
    category: ActionCategory;
    name: string;
    description: string;
    target?: string;
    payload?: any;
    requiresConfirmation?: boolean;
    isReversible?: boolean;
  }): VerifiedAction {
    const existing = this.activeActions.find(
      a => a.name === params.name && a.target === params.target && (a.status === "running" || a.status === "awaiting_confirmation")
    );
    if (existing) {
      return existing;
    }

    const action: VerifiedAction = {
      id: Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36),
      category: params.category,
      name: params.name,
      description: params.description,
      target: params.target,
      payload: params.payload,
      status: params.requiresConfirmation ? "awaiting_confirmation" : "pending",
      requiresConfirmation: Boolean(params.requiresConfirmation),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      isReversible: params.isReversible
    };

    this.activeActions.push(action);
    this.actionHistory.unshift(action);
    this.notify();
    return action;
  }

  public async executeAppLaunch(appName: string, webFallbackUrl: string, intentScheme?: string): Promise<VerifiedAction> {
    const action = this.planAction({
      category: "app_launcher",
      name: `Open ${appName}`,
      description: `Launching ${appName} via Android intent / web portal`,
      target: appName,
      payload: { webFallbackUrl, intentScheme }
    });

    action.status = "running";
    this.notify();

    try {
      const targetUrl = intentScheme && typeof navigator !== "undefined" && navigator.userAgent.includes("Android") ? intentScheme : webFallbackUrl;
      const win = window.open(targetUrl, "_blank");
      if (win || targetUrl.startsWith("http")) {
        action.status = "succeeded";
        action.resultMessage = `Successfully launched ${appName}`;
      } else {
        action.status = "unverified";
        action.resultMessage = `Attempted launch for ${appName}. Verify if open in background.`;
      }
    } catch (err: any) {
      action.status = "failed";
      action.errorMessage = err.message || "Failed to trigger launch intent";
    }

    this.activeActions = this.activeActions.filter(a => a.id !== action.id);
    this.notify();
    return action;
  }

  public executePhoneCall(recipientName: string, phoneNumber: string): VerifiedAction {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, "");
    const action = this.planAction({
      category: "communication",
      name: `Call ${recipientName}`,
      description: `Initiating voice call to ${phoneNumber}`,
      target: phoneNumber,
      payload: { cleanNumber }
    });

    try {
      window.location.href = `tel:${cleanNumber}`;
      action.status = "succeeded";
      action.resultMessage = `Dialer launched for ${recipientName} (${phoneNumber})`;
    } catch (err: any) {
      action.status = "failed";
      action.errorMessage = err.message || "Could not launch phone dialer";
    }

    this.activeActions = this.activeActions.filter(a => a.id !== action.id);
    this.notify();
    return action;
  }

  public executeSMS(recipientName: string, phoneNumber: string, messageText: string): VerifiedAction {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, "");
    const action = this.planAction({
      category: "communication",
      name: `SMS to ${recipientName}`,
      description: `Dispatching SMS message to ${phoneNumber}`,
      target: phoneNumber,
      payload: { messageText }
    });

    try {
      window.location.href = `sms:${cleanNumber}?body=${encodeURIComponent(messageText)}`;
      action.status = "succeeded";
      action.resultMessage = `SMS composer prepared for ${recipientName}`;
    } catch (err: any) {
      action.status = "failed";
      action.errorMessage = err.message || "Could not launch SMS intent";
    }

    this.activeActions = this.activeActions.filter(a => a.id !== action.id);
    this.notify();
    return action;
  }

  public executeWhatsApp(recipientPhone: string, messageText: string): VerifiedAction {
    const cleanNumber = recipientPhone.replace(/[^0-9]/g, "");
    const action = this.planAction({
      category: "communication",
      name: "WhatsApp Message",
      description: `Sending WhatsApp message to +${cleanNumber}`,
      target: recipientPhone,
      payload: { messageText }
    });

    try {
      const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
      window.open(waUrl, "_blank");
      action.status = "succeeded";
      action.resultMessage = `WhatsApp conversation opened for +${cleanNumber}`;
    } catch (err: any) {
      action.status = "failed";
      action.errorMessage = err.message || "Could not launch WhatsApp";
    }

    this.activeActions = this.activeActions.filter(a => a.id !== action.id);
    this.notify();
    return action;
  }

  public executeMediaPlayback(trackTitle: string, videoId?: string, isDirectEmbed = false): VerifiedAction {
    const action = this.planAction({
      category: "media_playback",
      name: `Play: ${trackTitle}`,
      description: `Media playback request for ${trackTitle}`,
      target: videoId || trackTitle
    });

    if (isDirectEmbed) {
      action.status = "succeeded";
      action.resultMessage = `Playing ${trackTitle} in MAYRA Audio Hub`;
    } else {
      action.status = "unverified";
      action.resultMessage = `Playback dispatched. If external app opened, check volume.`;
    }

    this.activeActions = this.activeActions.filter(a => a.id !== action.id);
    this.notify();
    return action;
  }

  public executeNavigation(targetPage: string, onNavigateCallback: () => boolean): VerifiedAction {
    const action = this.planAction({
      category: "navigation",
      name: `Navigate to ${targetPage}`,
      description: `Navigating to ${targetPage} screen`,
      target: targetPage,
      isReversible: true
    });

    try {
      const success = onNavigateCallback();
      if (success) {
        action.status = "succeeded";
        action.resultMessage = `Switched to ${targetPage}`;
      } else {
        action.status = "failed";
        action.errorMessage = `Navigation to ${targetPage} was not possible from current state`;
      }
    } catch (err: any) {
      action.status = "failed";
      action.errorMessage = err.message || "Navigation failed";
    }

    this.activeActions = this.activeActions.filter(a => a.id !== action.id);
    this.notify();
    return action;
  }

  public saveMediaFile(blob: Blob, filename: string, isVideo = false): VerifiedAction {
    const action = this.planAction({
      category: "camera",
      name: `Save ${isVideo ? "Video" : "Photo"}`,
      description: `Saving ${filename} to device storage`,
      target: filename
    });

    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      action.status = "succeeded";
      action.resultMessage = `Saved ${filename} (${(blob.size / 1024).toFixed(1)} KB) successfully`;
    } catch (err: any) {
      action.status = "failed";
      action.errorMessage = err.message || "Failed to download media file";
    }

    this.activeActions = this.activeActions.filter(a => a.id !== action.id);
    this.notify();
    return action;
  }
}

export const actionExecutor = new ActionExecutorService();
