-- Create Merchants Table
CREATE TABLE "Merchant" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "apiKey" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "webhookUrl" TEXT,
  "telegramChatId" TEXT,
  "secretKey" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Transactions Table
CREATE TABLE "Transaction" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "merchantId" TEXT REFERENCES "Merchant"("id") ON DELETE CASCADE,
  "status" TEXT DEFAULT 'PENDING',
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT DEFAULT 'USD',
  "externalRef" TEXT,
  "md5Hash" TEXT,
  "qrString" TEXT,
  "demoAutoConfirm" BOOLEAN DEFAULT true,
  "fromAccountId" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "confirmedAt" TIMESTAMP WITH TIME ZONE
);
