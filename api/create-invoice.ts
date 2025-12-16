
export default async function handler(req, res) {
  // 1. Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Получаем токен из переменных окружения Vercel
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is missing');
    return res.status(500).json({ error: 'Server misconfiguration: Bot Token missing' });
  }

  try {
    const { title, description, price, initData } = req.body;

    // Валидация входных данных
    if (!title || !price) {
      return res.status(400).json({ error: 'Missing title or price' });
    }

    // 3. Формируем запрос к API Телеграма
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`;

    const invoiceData = {
      title: title,
      description: description || 'Payment for services',
      payload: `order_${Date.now()}_${Math.random().toString(36).substring(7)}`, // Уникальный ID заказа
      provider_token: "", // ВАЖНО: Для Telegram Stars этот параметр должен быть пустым!
      currency: "XTR",    // Валюта для Telegram Stars
      prices: [{ label: title, amount: parseInt(price) }],
      // Можно добавить валидацию пользователя через initData, если требуется повышенная безопасность
    };

    // 4. Отправляем запрос
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API Error:', data);
      return res.status(500).json({ error: 'Failed to create invoice', details: data.description });
    }

    // 5. Возвращаем ссылку на оплату фронтенду
    return res.status(200).json({ invoiceLink: data.result });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
