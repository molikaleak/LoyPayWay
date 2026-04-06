"use client";

import { useState } from "react";
import { apiRequest } from "../lib/api";
import { useMerchantSession } from "./merchant-session";

export function OnboardingCard() {
  const { refreshMerchants, setApiKey, setSelectedMerchantId } = useMerchantSession();
  const [form, setForm] = useState({
    name: "",
    accountId: "",
    webhookUrl: "",
    telegramChatId: "",
  });
  const [status, setStatus] = useState("");
  const [createdKey, setCreatedKey] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");

    try {
      const data = await apiRequest("/api/merchant/register", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setCreatedKey(data.onboarding.apiKey);
      setApiKey(data.onboarding.apiKey);
      setSelectedMerchantId(data.merchant.id);
      await refreshMerchants(data.merchant.id);
      setForm({ name: "", accountId: "", webhookUrl: "", telegramChatId: "" });
      setStatus("Merchant created and session stored locally.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel panel-accent stack-gap">
      <div className="panel-header">
        <h3>Merchant onboarding</h3>
        <span className="muted">Create a working merchant without leaving the dashboard</span>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="field">
          <span>Merchant name</span>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Sunrise Coffee"
            required
          />
        </label>
        <label className="field">
          <span>Bakong account ID</span>
          <input
            value={form.accountId}
            onChange={(event) => setForm({ ...form, accountId: event.target.value })}
            placeholder="012345678@aclb"
            required
          />
        </label>
        <label className="field">
          <span>Webhook URL</span>
          <input
            value={form.webhookUrl}
            onChange={(event) => setForm({ ...form, webhookUrl: event.target.value })}
            placeholder="https://example.com/webhooks/payments"
          />
        </label>
        <label className="field">
          <span>Telegram chat ID</span>
          <input
            value={form.telegramChatId}
            onChange={(event) => setForm({ ...form, telegramChatId: event.target.value })}
            placeholder="-1001234567890"
          />
        </label>
        <button className="button button-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create merchant"}
        </button>
      </form>
      {status ? <p className="notice">{status}</p> : null}
      {createdKey ? (
        <div className="credential-card">
          <span className="muted">API key saved for this browser session</span>
          <code>{createdKey}</code>
        </div>
      ) : null}
    </section>
  );
}

