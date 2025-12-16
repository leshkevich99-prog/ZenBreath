// Telegram WebApp Types
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
        // Payment function
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        // Haptic Feedback
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
      };
    };
  }
}

// Export WebApp object
export const tg = window.Telegram?.WebApp;

// Initialize (expand to full screen)
export const initTelegram = () => {
  if (tg) {
    tg.ready();
    try {
      tg.expand();
    } catch (e) {
      console.log('Expand not supported');
    }
  }
};

// Haptic feedback helper
export const hapticImpact = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(style);
  }
};

// --- REAL PAYMENT FUNCTION ---
export const buyStars = async (amount: number, title: string, description: string): Promise<boolean> => {
  return new Promise(async (resolve) => {
    
    // 1. Environment check
    if (!tg || !tg.initData) {
      alert("Payment is only available inside Telegram!");
      resolve(false);
      return;
    }

    try {
      // 2. Request Invoice Link from YOUR Backend
      // The endpoint /api/create-invoice handles the Bot API call securely
      const response = await fetch('/api/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          description: description,
          price: amount,
          initData: tg.initData 
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.invoiceLink) {
        console.error("Payment API Error:", data);
        alert("Could not initialize payment. Please try again later.");
        resolve(false);
        return;
      }

      // 3. Open Telegram Native Invoice
      tg.openInvoice(data.invoiceLink, (status: string) => {
        // status: 'paid', 'cancelled', 'failed', 'pending'
        console.log(`Invoice status: ${status}`);
        
        if (status === 'paid') {
          if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
          resolve(true);
        } else if (status === 'failed') {
          if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
          alert("Payment failed.");
          resolve(false);
        } else {
          // Cancelled or Pending
          if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('warning');
          resolve(false);
        }
      });

    } catch (error) {
      console.error("Network Error:", error);
      alert("Network error. Please check your internet connection.");
      resolve(false);
    }
  });
};