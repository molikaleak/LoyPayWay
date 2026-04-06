const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeBakongCheckResponse, pollUntilConfirmed } = require("../src/poller");

test("normalizeBakongCheckResponse maps Bakong success payloads to SUCCESS", () => {
  const result = normalizeBakongCheckResponse({
    responseCode: 0,
    responseMessage: "Getting transaction successfully.",
    data: {
      hash: "full-hash",
      fromAccountId: "payer@bank",
      toAccountId: "merchant@bank",
      currency: "USD",
      amount: 1,
      description: "invoice-001",
    },
  }, "md5-hash");

  assert.equal(result.status, "SUCCESS");
  assert.equal(result.fromAccountId, "payer@bank");
  assert.equal(result.toAccountId, "merchant@bank");
  assert.equal(result.currency, "USD");
  assert.equal(result.amount, 1);
});

test("normalizeBakongCheckResponse maps Bakong failed payloads to FAILED", () => {
  const result = normalizeBakongCheckResponse({
    responseCode: 1,
    errorCode: 3,
    responseMessage: "Transaction failed.",
    data: null,
  }, "md5-hash");

  assert.equal(result.status, "FAILED");
  assert.equal(result.errorCode, 3);
});

test("pollUntilConfirmed retries transient errors and still resolves success", async () => {
  let attempts = 0;
  let onSuccessCalls = 0;

  const result = await pollUntilConfirmed(
    {
      md5Hash: "md5-hash",
      createdAt: new Date().toISOString(),
    },
    {
      onSuccess: async () => {
        onSuccessCalls += 1;
      },
    },
    {
      pollInterval: 1,
      expiryMs: 50,
      client: {
        async checkTransactionByMd5() {
          attempts += 1;
          if (attempts === 1) {
            throw new Error("temporary network issue");
          }

          return {
            status: "SUCCESS",
            confirmedAt: new Date().toISOString(),
          };
        },
      },
    },
  );

  assert.equal(result.status, "SUCCESS");
  assert.equal(onSuccessCalls, 1);
  assert.equal(attempts, 2);
});
