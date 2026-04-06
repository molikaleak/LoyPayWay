const { findMerchantByApiKey } = require("../store");

async function auth(req, res, next) {
  const authHeader = req.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const apiKey = token || req.get("x-api-key");

  if (!apiKey) {
    return res.status(401).json({ error: "Missing API key." });
  }

  try {
    const merchant = await findMerchantByApiKey(apiKey);
    if (!merchant || !merchant.isActive) {
      return res.status(401).json({ error: "Invalid API key." });
    }

    req.merchant = merchant;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  auth,
};
