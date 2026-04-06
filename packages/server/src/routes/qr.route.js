const crypto = require("node:crypto");
const express = require("express");
const { dispatch, generateQR, pollUntilConfirmed } = require("@loy-payway/core");
const { auth } = require("../middleware/auth");
const { merchantRateLimit } = require("../middleware/rateLimit");
const { findMerchantByApiKey, getStats, getTransactionById, listTransactions, saveTransaction, updateTransaction } = require("../store");

const router = express.Router();

router.post("/generate", merchantRateLimit, auth, async (req, res, next) => {
  try {
    const { amount, currency = "USD", externalRef, demoAutoConfirm = true } = req.body || {};
    const payload = await generateQR({
      accountId: req.merchant.accountId,
      merchantName: req.merchant.name,
      amount,
      currency,
      externalRef,
    });

    const transaction = await saveTransaction({
      id: crypto.randomUUID(),
      merchantId: req.merchant.id,
      status: "PENDING",
      createdAt: new Date(),
      confirmedAt: null,
      fromAccountId: null,
      demoAutoConfirm,
      ...payload,
    });

    void pollUntilConfirmed(
      transaction,
      {
        onSuccess: async (result) => {
          const updated = await updateTransaction(transaction.id, {
            status: "SUCCESS",
            confirmedAt: result.confirmedAt || new Date(),
            fromAccountId: result.fromAccountId || null,
          });

          if (updated) {
            await dispatch(req.merchant, updated);
          }
        },
        onFailed: async () => {
          await updateTransaction(transaction.id, {
            status: "FAILED",
          });
        },
        onExpire: async () => {
          await updateTransaction(transaction.id, {
            status: "EXPIRED",
          });
        },
      },
    ).catch(async (error) => {
      console.error("[qr] Failed while polling transaction:", error.message);

      const current = await getTransactionById(transaction.id);
      if (!current || current.status !== "PENDING") {
        return;
      }

      await updateTransaction(transaction.id, { status: "FAILED" });
    });

    res.status(201).json({
      transaction,
      instructions: "Show qrString in the merchant UI and poll GET /api/transactions/:id for the status.",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/qr/transactions
 * 
 * Protected: scopes transactions to the authenticated merchant.
 * If an API key is provided (Bearer token), only that merchant's transactions are returned.
 * If a merchantId query param is provided, it must match the authenticated merchant.
 * This ensures no one can view another merchant's transaction data.
 */
router.get("/transactions", async (req, res, next) => {
  try {
    // Try to resolve merchant from API key
    const authHeader = req.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const apiKey = token || req.get("x-api-key");

    let merchantId = req.query.merchantId;

    if (apiKey) {
      const merchant = await findMerchantByApiKey(apiKey);
      if (merchant) {
        // API key present and valid: always scope to this merchant only
        merchantId = merchant.id;
      }
    }

    if (!merchantId) {
      return res.json({ transactions: [], stats: { totalTransactions: 0, successfulTransactions: 0, pendingTransactions: 0, expiredTransactions: 0, totalRevenue: 0 } });
    }

    res.json({
      transactions: await listTransactions({ merchantId }),
      stats: await getStats({ merchantId }),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/transactions/:id", async (req, res, next) => {
  try {
    const transaction = await getTransactionById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    // If API key is present, validate the transaction belongs to that merchant
    const authHeader = req.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const apiKey = token || req.get("x-api-key");

    if (apiKey) {
      const merchant = await findMerchantByApiKey(apiKey);
      if (merchant && transaction.merchantId !== merchant.id) {
        return res.status(403).json({ error: "Access denied. This transaction does not belong to your account." });
      }
    }

    return res.json({ transaction });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
