const axios = require("axios");
const { getBearerToken } = require("./token");

const DEFAULT_POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || 5000);
const DEFAULT_EXPIRY_MS = Number(process.env.QR_EXPIRY_SECONDS || 600) * 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeBakongCheckResponse(payload, md5Hash) {
  if (payload?.responseCode === 0 && payload.data) {
    return {
      status: "SUCCESS",
      md5Hash,
      hash: payload.data.hash || null,
      fromAccountId: payload.data.fromAccountId || null,
      toAccountId: payload.data.toAccountId || null,
      currency: payload.data.currency || null,
      amount: payload.data.amount == null ? null : Number(payload.data.amount),
      description: payload.data.description || null,
      responseCode: payload.responseCode,
      responseMessage: payload.responseMessage || null,
    };
  }

  if (payload?.responseCode === 1 && payload?.errorCode === 3) {
    return {
      status: "FAILED",
      md5Hash,
      errorCode: payload.errorCode,
      responseCode: payload.responseCode,
      responseMessage: payload.responseMessage || "Transaction failed.",
    };
  }

  if (payload?.responseCode === 1) {
    return {
      status: "PENDING",
      md5Hash,
      errorCode: payload.errorCode ?? null,
      responseCode: payload.responseCode,
      responseMessage: payload.responseMessage || null,
    };
  }

  return {
    status: "PENDING",
    md5Hash,
    responseCode: payload?.responseCode ?? null,
    responseMessage: payload?.responseMessage || null,
  };
}

function createBakongClient() {
  const demoEnabled = process.env.PAYWAY_ALLOW_DEMO !== "false";
  const baseURL = process.env.BAKONG_API_BASE || "https://api-bakong.nbc.gov.kh";

  if (demoEnabled || !process.env.BAKONG_BEARER_TOKEN) {
    const pollStartTimes = new Map();
    return {
      async checkTransactionByMd5(md5Hash, transaction) {
        if (!pollStartTimes.has(transaction.id)) {
          pollStartTimes.set(transaction.id, Date.now());
        }
        const age = Date.now() - pollStartTimes.get(transaction.id);
        if (transaction.demoAutoConfirm && age >= 3000) {
          return {
            status: "SUCCESS",
            amount: transaction.amount,
            currency: transaction.currency,
            fromAccountId: "demo-customer@bakong",
            externalRef: transaction.externalRef,
            confirmedAt: new Date().toISOString(),
          };
        }

        if (age >= DEFAULT_EXPIRY_MS) {
          return { status: "EXPIRED" };
        }

        return { status: "PENDING", md5Hash };
      },
    };
  }

  const client = axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${getBearerToken()}`,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });

  return {
    async checkTransactionByMd5(md5Hash) {
      const { data } = await client.post("/v1/check_transaction_by_md5", { md5: md5Hash });
      return normalizeBakongCheckResponse(data, md5Hash);
    },
  };
}

async function pollUntilConfirmed(transaction, callbacks = {}, options = {}) {
  const pollInterval = options.pollInterval || DEFAULT_POLL_INTERVAL;
  const expiryMs = options.expiryMs || DEFAULT_EXPIRY_MS;
  const client = options.client || createBakongClient();
  const startedAt = Date.now();

  while (Date.now() - startedAt < expiryMs) {
    let result;

    try {
      result = await client.checkTransactionByMd5(transaction.md5Hash, transaction);
    } catch (error) {
      console.error("[bakong] Transaction status check failed:", error.message);
      await sleep(pollInterval);
      continue;
    }

    if (result.status === "SUCCESS") {
      if (callbacks.onSuccess) {
        await callbacks.onSuccess(result);
      }
      return result;
    }

    if (result.status === "FAILED") {
      if (callbacks.onFailed) {
        await callbacks.onFailed(result);
      }
      return result;
    }

    if (result.status === "EXPIRED") {
      if (callbacks.onExpire) {
        await callbacks.onExpire(transaction.md5Hash);
      }
      return result;
    }

    await sleep(pollInterval);
  }

  if (callbacks.onExpire) {
    await callbacks.onExpire(transaction.md5Hash);
  }

  return { status: "EXPIRED" };
}

module.exports = {
  createBakongClient,
  normalizeBakongCheckResponse,
  pollUntilConfirmed,
};
