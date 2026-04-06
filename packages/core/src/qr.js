const crypto = require("node:crypto");
const { BakongKHQR, khqrData, IndividualInfo, MerchantInfo } = require("bakong-khqr");

/**
 * Normalizes numbers for currency precision.
 * @param {number|string} amount 
 * @returns {number}
 */
function normalizeAmount(amount) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error("Amount must be a positive number.");
  }
  return Number(numeric.toFixed(2));
}

/**
 * Generates a real KHQR string using the official Bakong KHQR SDK.
 * This produces QR codes that are fully compliant with the NBC standard
 * and scannable by ABA, ACLEDA, Bakong, Wing, and all other Cambodian banking apps.
 *
 * @param {object} opts
 * @param {string} opts.accountId   Bakong account (e.g. "merchant@bank")
 * @param {string} [opts.merchantName]
 * @param {number|string} opts.amount
 * @param {string} [opts.currency]  "USD" | "KHR"
 * @param {string} [opts.externalRef]
 * @param {string} [opts.merchantType] "individual" | "merchant" (default: "individual")
 * @param {string} [opts.acquiringBank] Required for merchant type
 * @param {string} [opts.merchantId]   Required for merchant type
 */
async function generateQR({
  accountId,
  merchantName,
  amount,
  currency = "USD",
  externalRef,
  merchantType = "individual",
  acquiringBank,
  merchantId,
}) {
  if (!accountId) {
    throw new Error("accountId is required to generate a KHQR.");
  }

  const normalizedAmount = normalizeAmount(amount);
  const refId = externalRef || crypto.randomUUID().slice(0, 8);
  const mName = (merchantName || "Loy Payway Merchant").slice(0, 25);
  const currencyCode = currency.toUpperCase() === "KHR"
    ? khqrData.currency.khr
    : khqrData.currency.usd;

  // Expiration: 30 minutes from now (dynamic QR requires this)
  const expiryMs = Number(process.env.QR_EXPIRY_SECONDS || 600) * 1000;
  const expirationTimestamp = String(Date.now() + expiryMs);

  const khqr = new BakongKHQR();
  let result;

  if (merchantType === "merchant" && acquiringBank && merchantId) {
    // Corporate Merchant QR (Tag 30)
    const info = new MerchantInfo(
      accountId,
      mName,
      "Phnom Penh",
      merchantId,
      acquiringBank,
      {
        currency: currencyCode,
        amount: normalizedAmount,
        billNumber: refId,
        expirationTimestamp,
      }
    );
    result = khqr.generateMerchant(info);
  } else {
    // Individual / Personal QR (Tag 29) — default and most common
    const info = new IndividualInfo(
      accountId,
      mName,
      "Phnom Penh",
      {
        currency: currencyCode,
        amount: normalizedAmount,
        billNumber: refId,
        expirationTimestamp,
      }
    );
    result = khqr.generateIndividual(info);
  }

  // Check for SDK errors
  if (result.status.code !== 0) {
    throw new Error(
      `KHQR SDK error (${result.status.errorCode}): ${result.status.message}`
    );
  }

  const qrString = result.data.qr;

  return {
    amount: normalizedAmount,
    currency,
    externalRef: refId,
    md5Hash: result.data.md5,
    qrString,
  };
}

module.exports = {
  generateQR,
  normalizeAmount,
};
