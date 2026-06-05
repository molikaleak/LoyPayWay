const crypto = require("node:crypto");

// ---------------------------------------------------------------------------
// Storage Backend Selection
// Uses Prisma + PostgreSQL when DATABASE_URL is valid,
// otherwise falls back to in-memory Maps for local dev.
// ---------------------------------------------------------------------------

let prisma = null;
let useDatabase = false;

function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL || "";
  return url.length > 0 && !url.includes("[pw]") && !url.includes("[id]");
}

async function initDatabase() {
  if (!isDatabaseConfigured()) {
    console.log("[store] DATABASE_URL not configured — using in-memory storage.");
    return;
  }

  try {
    const { Pool } = require("pg");
    const { PrismaPg } = require("@prisma/adapter-pg");
    const { PrismaClient } = require("@prisma/client");

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    
    await prisma.$connect();
    // Verify the connection actually works (lazy connect might not throw)
    await prisma.$queryRawUnsafe('SELECT 1');
    
    // Verify tables exist (throws if migrations haven't been run)
    await prisma.merchant.count();
    
    useDatabase = true;
    console.log("[store] Connected to PostgreSQL via Prisma.");
  } catch (error) {
    console.warn("[store] Database is configured but unreachable or tables are missing. Falling back to memory storage.");
    console.warn("[store]", error.message);
    prisma = null;
    useDatabase = false;
  }
}

// ---------------------------------------------------------------------------
// In-memory fallback stores
// ---------------------------------------------------------------------------

const memMerchants = new Map();
const memTransactions = new Map();

// ---------------------------------------------------------------------------
// Merchant Operations
// ---------------------------------------------------------------------------

async function createMerchant(input) {
  const id = input.id || crypto.randomUUID();
  const apiKey = input.apiKey || crypto.randomBytes(24).toString("hex");
  const merchant = {
    id,
    apiKey,
    name: input.name,
    accountId: input.accountId,
    webhookUrl: input.webhookUrl || null,
    telegramChatId: input.telegramChatId || null,
    secretKey: crypto.randomBytes(24).toString("hex"),
    isActive: true,
    createdAt: new Date(),
  };

  if (useDatabase) {
    return prisma.merchant.upsert({
      where: { id },
      update: merchant,
      create: merchant,
    });
  }

  memMerchants.set(id, merchant);
  return merchant;
}

async function listMerchants() {
  if (useDatabase) {
    const merchants = await prisma.merchant.findMany({ orderBy: { createdAt: "desc" } });
    return merchants.map((m) => ({ ...m, apiKeyPreview: `${m.apiKey.slice(0, 6)}...` }));
  }

  return [...memMerchants.values()].map((m) => ({
    ...m,
    apiKeyPreview: `${m.apiKey.slice(0, 6)}...`,
  }));
}

async function findMerchantById(id) {
  if (useDatabase) {
    return prisma.merchant.findUnique({ where: { id } });
  }
  return memMerchants.get(id) || null;
}

async function updateMerchant(id, input) {
  if (useDatabase) {
    try {
      return await prisma.merchant.update({
        where: { id },
        data: {
          name: input.name,
          accountId: input.accountId,
          webhookUrl: input.webhookUrl === "" ? null : input.webhookUrl,
          telegramChatId: input.telegramChatId === "" ? null : input.telegramChatId,
          isActive: input.isActive,
        },
      });
    } catch {
      return null;
    }
  }

  const existing = memMerchants.get(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    name: input.name ?? existing.name,
    accountId: input.accountId ?? existing.accountId,
    webhookUrl: input.webhookUrl === "" ? null : input.webhookUrl ?? existing.webhookUrl,
    telegramChatId: input.telegramChatId === "" ? null : input.telegramChatId ?? existing.telegramChatId,
    isActive: input.isActive ?? existing.isActive,
  };
  memMerchants.set(id, updated);
  return updated;
}

async function findMerchantByApiKey(apiKey) {
  if (useDatabase) {
    return prisma.merchant.findUnique({ where: { apiKey } });
  }
  return [...memMerchants.values()].find((m) => m.apiKey === apiKey) || null;
}

// ---------------------------------------------------------------------------
// Transaction Operations
// ---------------------------------------------------------------------------

async function saveTransaction(transaction) {
  if (useDatabase) {
    return prisma.transaction.create({ data: transaction });
  }
  memTransactions.set(transaction.id, transaction);
  return transaction;
}

async function updateTransaction(id, patch) {
  if (useDatabase) {
    try {
      return await prisma.transaction.update({ where: { id }, data: patch });
    } catch {
      return null;
    }
  }

  const existing = memTransactions.get(id);
  if (!existing) return null;

  const updated = { ...existing, ...patch };
  memTransactions.set(id, updated);
  return updated;
}

async function getTransactionById(id) {
  if (useDatabase) {
    return prisma.transaction.findUnique({ where: { id } });
  }
  return memTransactions.get(id) || null;
}

async function getTransactionByMd5(md5Hash) {
  if (useDatabase) {
    return prisma.transaction.findFirst({ where: { md5Hash } });
  }
  return [...memTransactions.values()].find((t) => t.md5Hash === md5Hash) || null;
}

async function listTransactions(filter = {}) {
  if (useDatabase) {
    const where = {};
    if (filter.merchantId) where.merchantId = filter.merchantId;
    return prisma.transaction.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  return [...memTransactions.values()]
    .filter((tx) => !filter.merchantId || tx.merchantId === filter.merchantId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getStats(filter = {}) {
  const items = await listTransactions(filter);
  const success = items.filter((tx) => tx.status === "SUCCESS");
  const revenueByCurrency = success.reduce((totals, tx) => {
    const currency = String(tx.currency || "USD").toUpperCase();
    const amount = Number(tx.amount || 0);
    totals[currency] = Number(((totals[currency] || 0) + amount).toFixed(2));
    return totals;
  }, {});

  const totalRevenue = Object.values(revenueByCurrency).reduce((sum, amount) => sum + Number(amount || 0), 0);

  return {
    totalTransactions: items.length,
    successfulTransactions: success.length,
    pendingTransactions: items.filter((tx) => tx.status === "PENDING").length,
    expiredTransactions: items.filter((tx) => tx.status === "EXPIRED").length,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    revenueByCurrency,
  };
}

// ---------------------------------------------------------------------------
// Demo Seed
// ---------------------------------------------------------------------------

async function seedDemoData() {
  if (useDatabase) {
    const count = await prisma.merchant.count();
    if (count > 0) return;
  } else {
    if (memMerchants.size > 0) return;
  }

  const merchant = await createMerchant({
    id: "demo-merchant-id",
    apiKey: "demo-api-key-sunrise-coffee-premium",
    name: "Sunrise Coffee",
    accountId: process.env.BAKONG_ACCOUNT_ID || "012345678@aclb",
    telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
  });

  const samples = [
    { amount: 4.5, status: "SUCCESS", createdAt: new Date(Date.now() - 3600_000) },
    { amount: 6.75, status: "PENDING", createdAt: new Date(Date.now() - 1800_000) },
    { amount: 2.0, status: "EXPIRED", createdAt: new Date(Date.now() - 7200_000) },
  ];

  for (const [index, sample] of samples.entries()) {
    await saveTransaction({
      id: crypto.randomUUID(),
      md5Hash: crypto.createHash("md5").update(`${merchant.id}-${index}`).digest("hex"),
      qrString: `demo-sample-${index}`,
      amount: sample.amount,
      currency: "USD",
      status: sample.status,
      fromAccountId: sample.status === "SUCCESS" ? "demo-user@bakong" : null,
      externalRef: `demo-${index + 1}`,
      merchantId: merchant.id,
      createdAt: sample.createdAt,
      confirmedAt: sample.status === "SUCCESS" ? new Date() : null,
      demoAutoConfirm: true,
    });
  }
}

module.exports = {
  initDatabase,
  createMerchant,
  findMerchantByApiKey,
  findMerchantById,
  getStats,
  getTransactionById,
  getTransactionByMd5,
  listMerchants,
  listTransactions,
  saveTransaction,
  seedDemoData,
  updateMerchant,
  updateTransaction,
};
