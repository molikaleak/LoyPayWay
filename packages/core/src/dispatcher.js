const axios = require("axios");
const crypto = require("node:crypto");

async function sendTelegramMessage(chatId, message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) {
    return;
  }

  await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text: message,
  });
}

function signPayload(secretKey, body) {
  return crypto.createHmac("sha256", secretKey).update(JSON.stringify(body)).digest("hex");
}

async function dispatch(merchant, txData) {
  if (txData.status !== "SUCCESS") {
    return;
  }

  const body = {
    event: "payment.success",
    merchantId: merchant.id,
    transaction: txData,
  };

  const message = [
    "Payment received",
    `Merchant: ${merchant.name}`,
    `Amount: ${txData.amount} ${txData.currency}`,
    `From: ${txData.fromAccountId || "N/A"}`,
    `Reference: ${txData.externalRef || "N/A"}`,
  ].join("\n");

  if (merchant.telegramChatId) {
    await sendTelegramMessage(merchant.telegramChatId, message);
  }

  if (merchant.webhookUrl) {
    const signature = signPayload(merchant.secretKey, body);
    await axios.post(merchant.webhookUrl, body, {
      headers: {
        "Content-Type": "application/json",
        "X-PayWay-Signature": signature,
      },
    });
  }
}

module.exports = {
  dispatch,
  signPayload,
};

