// Minimal Telegram WebApp wrapper.
// In browser (non-Telegram) this degrades gracefully.

type Haptic = "light" | "medium" | "heavy" | "success";

class TelegramService {
  private webApp: any;

  constructor() {
    const w = window as any;
    this.webApp = w?.Telegram?.WebApp;
    try {
      this.webApp?.ready?.();
    } catch {
      // ignore
    }
  }

  getUser() {
    return this.webApp?.initDataUnsafe?.user ?? null;
  }

  hapticFeedback(type: Haptic = "light") {
    try {
      if (type === "success") this.webApp?.HapticFeedback?.notificationOccurred?.("success");
      else this.webApp?.HapticFeedback?.impactOccurred?.(type);
    } catch {
      // ignore
    }
  }

  showAlert(message: string) {
    if (this.webApp?.showAlert) return this.webApp.showAlert(message);
    // eslint-disable-next-line no-alert
    alert(message);
  }
}

export const telegram = new TelegramService();

