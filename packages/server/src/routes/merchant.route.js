const express = require("express");
const { createMerchant, findMerchantById, listMerchants, updateMerchant } = require("../store");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, accountId, webhookUrl, telegramChatId } = req.body || {};
    if (!name || !accountId) {
      return res.status(400).json({ error: "name and accountId are required." });
    }

    const merchant = await createMerchant({ name, accountId, webhookUrl, telegramChatId });
    return res.status(201).json({
      merchant,
      onboarding: {
        apiKey: merchant.apiKey,
        nextStep: "Use this API key as a Bearer token when calling /api/qr/generate.",
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    res.json({ merchants: await listMerchants() });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const merchant = await findMerchantById(req.params.id);
    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found." });
    }
    return res.json({ merchant });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const merchant = await updateMerchant(req.params.id, req.body || {});
    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found." });
    }
    return res.json({ merchant });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
