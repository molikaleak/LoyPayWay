const test = require("node:test");
const assert = require("node:assert/strict");
const { generateQR, normalizeAmount } = require("../src/qr");

test("normalizeAmount rejects invalid input", () => {
  assert.throws(() => normalizeAmount(0), /positive number/);
});

test("generateQR returns a valid KHQR string via official SDK", async () => {
  const result = await generateQR({
    accountId: "012345678@aclb",
    merchantName: "Demo Shop",
    amount: 1.25,
    externalRef: "ref-123",
  });

  assert.equal(result.amount, 1.25);
  assert.equal(result.externalRef, "ref-123");
  // Official SDK output starts with EMVCo header
  assert.match(result.qrString, /^000201/);
  // Must end with CRC (6304 + 4 hex chars)
  assert.match(result.qrString, /6304[0-9A-Fa-f]{4}$/);
  // md5 must be a 32-char hex string
  assert.equal(result.md5Hash.length, 32);
  // QR string must contain the Bakong account ID
  assert.ok(result.qrString.includes("012345678@aclb"));
});
