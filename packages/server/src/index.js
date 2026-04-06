require("dotenv").config({ path: require("node:path").join(__dirname, "../../../.env"), override: true });
require("dotenv").config({ override: true });

const cors = require("cors");
const express = require("express");
const merchantRoutes = require("./routes/merchant.route");
const qrRoutes = require("./routes/qr.route");
const webhookRoutes = require("./routes/webhook.route");
const { initDatabase, seedDemoData } = require("./store");

function createApp() {
  const app = express();
  const demoEnabled = process.env.PAYWAY_ALLOW_DEMO !== "false";

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      mode: demoEnabled ? "demo" : "live",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api", (_req, res) => {
    res.json({
      name: "Loy Payway API",
      version: "0.1.0",
      routes: [
        "POST /api/merchant/register",
        "GET /api/merchant",
        "POST /api/qr/generate",
        "GET /api/qr/transactions",
        "GET /api/qr/transactions/:id",
        "POST /api/webhook/preview",
      ],
    });
  });

  app.use("/api/merchant", merchantRoutes);
  app.use("/api/qr", qrRoutes);
  app.use("/api/webhook", webhookRoutes);

  app.use((error, _req, res, _next) => {
    res.status(500).json({
      error: error.message || "Internal server error.",
    });
  });

  return app;
}

async function start() {
  await initDatabase();
  await seedDemoData();

  const port = Number(process.env.PORT || 3000);
  createApp().listen(port, () => {
    console.log(`Loy Payway server running on http://localhost:${port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

module.exports = {
  createApp,
};
