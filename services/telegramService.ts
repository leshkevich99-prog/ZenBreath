// Mocking the Telegram WebApp type for development outside Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: any;
        ready: () => void;
        expand: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          showProgress: (leaveActive: boolean) => void;
          hideProgress: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        themeParams: any;
      };
    };
  }
}

export const tg = window.Telegram?.WebApp;

export const initTelegram = () => {
  if (tg) {
    tg.ready();
    tg.expand();
  }
};

export const hapticImpact = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(style);
  }
};

// Simulation of a payment provider since we don't have a backend to generate real invoices here.
// In a real app, you would fetch an invoice link from your bot backend.
export const buyStars = (amount: number): Promise<boolean> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // In a real TWA, we would use tg.openInvoice(invoiceLink).
      // Here we just resolve true for demo purposes.
      const confirmed = window.confirm(`Подтвердить оплату ${amount} Stars? (Тестовый режим)`);
      if (confirmed) {
        if (tg?.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred('success');
        }
        resolve(true);
      } else {
        resolve(false);
      }
    }, 500);
  });
};