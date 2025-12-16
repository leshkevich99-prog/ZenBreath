// Объявление типов для Telegram WebApp
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
        // Функция оплаты:
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        // Вибрация:
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
      };
    };
  }
}

// Экспорт объекта WebApp для удобства
export const tg = window.Telegram?.WebApp;

// Инициализация (расширяем на весь экран)
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

// Вибрация (для приятных ощущений при клике)
export const hapticImpact = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(style);
  }
};

// --- ГЛАВНАЯ ФУНКЦИЯ ОПЛАТЫ ---
export const buyStars = async (amount: number, title: string, description: string): Promise<boolean> => {
  return new Promise(async (resolve) => {
    
    // 1. Проверка: если открыто не в Телеграме, оплата не сработает
    if (!tg || !tg.initData) {
      alert("Payment is only available inside Telegram!");
      resolve(false);
      return;
    }

    try {
      // 2. Запрашиваем ссылку на оплату у вашего сервера (Vercel)
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,             // Name (e.g. "Energy Technique")
          description: description, // Description
          price: amount             // Price in Stars
        }),
      });

      const data = await response.json();

      if (!data.link) {
        console.error("Error: Server did not return link", data);
        alert("Error creating invoice. Please try again later.");
        resolve(false);
        return;
      }

      // 3. Открываем нативное окно оплаты Telegram
      tg.openInvoice(data.link, (status: string) => {
        // status может быть 'paid', 'cancelled', 'failed', 'pending'
        if (status === 'paid') {
          // Успех! Вибрируем телефоном
          if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
          resolve(true);
        } else {
          // Отмена или ошибка
          if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
          resolve(false);
        }
      });

    } catch (error) {
      console.error("Network error:", error);
      alert("Network Error");
      resolve(false);
    }
  });
};