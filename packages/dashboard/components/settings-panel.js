"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { useMerchantSession } from "./merchant-session";

export function SettingsPanel() {
  const { refreshMerchants, selectedMerchant, setApiKey } = useMerchantSession();
  const [form, setForm] = useState({
    name: "",
    accountId: "",
    webhookUrl: "",
    telegramChatId: "",
  });
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: selectedMerchant?.name || "",
      accountId: selectedMerchant?.accountId || "",
      webhookUrl: selectedMerchant?.webhookUrl || "",
      telegramChatId: selectedMerchant?.telegramChatId || "",
    });
  }, [selectedMerchant]);

  async function handleSave(event) {
    event.preventDefault();
    if (!selectedMerchant?.id) {
      setStatus("Select a merchant first.");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      await apiRequest(`/api/merchant/${selectedMerchant.id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      await refreshMerchants(selectedMerchant.id);
      setStatus("Merchant settings updated.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="stack-grid-2">
      <section className="panel stack-gap">
        <div className="panel-header">
          <h2>Merchant settings</h2>
          <span className="muted">Update merchant profile and configurations.</span>
        </div>
        <form className="form-grid" onSubmit={handleSave}>
          <label className="field">
            <span>Merchant name</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <label className="field">
            <span>Bakong account ID</span>
            <input
              value={form.accountId}
              onChange={(event) => setForm({ ...form, accountId: event.target.value })}
              required
            />
          </label>
          <label className="field field-wide">
            <span>Webhook URL</span>
            <input
              value={form.webhookUrl}
              onChange={(event) => setForm({ ...form, webhookUrl: event.target.value })}
              placeholder="https://example.com/webhook"
            />
          </label>
          <label className="field field-wide">
            <span>Telegram chat ID</span>
            <input
              value={form.telegramChatId}
              onChange={(event) => setForm({ ...form, telegramChatId: event.target.value })}
              placeholder="-1001234567890"
            />
          </label>
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save settings"}
          </button>
        </form>
        {status ? <p className="notice">{status}</p> : null}
      </section>

      <section className="panel stack-gap">
        <div className="panel-header">
          <h3>API credentials</h3>
          <span className="muted">Merchant credentials for API integration.</span>
        </div>
        {selectedMerchant ? (
          <div className="detail-grid">
            <div className="detail-card">
              <span className="muted">Merchant ID</span>
              <strong className="hash">{selectedMerchant.id}</strong>
            </div>
            <div className="detail-card">
              <span className="muted">API key</span>
              <strong className="hash">{selectedMerchant.apiKey}</strong>
            </div>
            <div className="detail-card">
              <span className="muted">Secret key</span>
              <strong className="hash">{selectedMerchant.secretKey}</strong>
            </div>
            <button
              className="button"
              type="button"
              style={{ gridColumn: "1 / -1", marginTop: "8px", width: "100%" }}
              onClick={() => {
                setApiKey(selectedMerchant.apiKey);
                setStatus("API key refreshed from selected merchant.");
              }}
            >
              Reuse selected merchant API key
            </button>
          </div>
        ) : (
          <div className="empty-state">Create or choose a merchant to edit settings.</div>
        )}
      </section>
    </section>
  );
}

