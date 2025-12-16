
export default async function handler(req, res) {
  // --- CORS HEADERS ---
  // Разрешаем запросы с любого источника (для WebApp это важно)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Обработка preflight запроса (браузер проверяет доступность сервера)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  // ---------------------

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is missing');
    return res.status(500).json({ error: 'Server misconfiguration: Bot Token missing' });
  }

  try {
    const { title, description, price, initData } = req.body;

    if (!title || !price) {
      return res.status(400).json({ error: 'Missing title or price' });
    }

    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`;

    const invoiceData = {
      title: title,
      description: description || 'Payment for services',
      payload: `order_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      provider_token: "", // Пусто для Telegram Stars
      currency: "XTR",    // Валюта XTR
      prices: [{ label: title, amount: parseInt(price) }],
    };

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

    return res.status(200).json({ invoiceLink: data.result });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
