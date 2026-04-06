const express = require("express");
const { signPayload } = require("@loy-payway/core");

const router = express.Router();

router.post("/preview", (req, res) => {
  const secret = req.body?.secretKey || "preview-secret";
  const payload = req.body?.payload || {
    event: "payment.success",
    transactionId: "demo",
  };

  res.json({
    payload,
    signature: signPayload(secret, payload),
  });
});

module.exports = router;
