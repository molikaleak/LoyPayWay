const rateLimit = require("express-rate-limit");

const merchantRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  merchantRateLimit,
};

