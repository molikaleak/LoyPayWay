function getBearerToken() {
  const token = process.env.BAKONG_BEARER_TOKEN;
  const demoEnabled = process.env.PAYWAY_ALLOW_DEMO !== "false";
  if (!token && !demoEnabled) {
    throw new Error("BAKONG_BEARER_TOKEN is required when demo mode is disabled.");
  }

  return token || "demo-token";
}

module.exports = {
  getBearerToken,
};
