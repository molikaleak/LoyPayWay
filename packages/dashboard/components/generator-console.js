"use client";

import { useEffect, useState } from "react";
import { apiRequest, formatCurrency, formatDateTime } from "../lib/api";
import { QRCodeSVG } from "qrcode.react";
import { useMerchantSession } from "./merchant-session";

export function GeneratorConsole() {
  const { apiKey, selectedMerchant } = useMerchantSession();
  const [form, setForm] = useState({
    amount: "4.50",
    currency: "USD",
    externalRef: "",
    demoAutoConfirm: true,
  });
  const [transaction, setTransaction] = useState(null);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!transaction?.id || transaction.status !== "PENDING") {
      return;
    }

    let active = true;
    const interval = window.setInterval(async () => {
      try {
        const data = await apiRequest(`/api/qr/transactions/${transaction.id}`);
        if (active) {
          setTransaction(data.transaction);
          if (data.transaction.status !== "PENDING") {
            setStatus(`Transaction ${data.transaction.status.toLowerCase()} at ${formatDateTime(data.transaction.confirmedAt)}`);
          }
        }
      } catch (error) {
        if (active) {
          setStatus(error.message);
        }
      }
    }, 2000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [transaction?.id, transaction?.status]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedMerchant || !apiKey) {
      setStatus("Create or select a merchant first.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      const data = await apiRequest("/api/qr/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          amount: Number(form.amount),
          currency: form.currency,
          externalRef: form.externalRef || undefined,
          demoAutoConfirm: form.demoAutoConfirm,
        }),
      });

      setTransaction(data.transaction);
      setStatus("QR generated. Waiting for payment confirmation...");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="stack-grid-2">
      <section className="panel stack-gap">
        <div className="panel-header">
          <h2>Generate payment QR</h2>
          <span className="muted">{selectedMerchant ? selectedMerchant.name : "No merchant selected"}</span>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Amount</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
              required
            />
          </label>
          <label className="field">
            <span>Currency</span>
            <select
              className="select"
              value={form.currency}
              onChange={(event) => setForm({ ...form, currency: event.target.value })}
            >
              <option value="USD">USD</option>
              <option value="KHR">KHR</option>
            </select>
          </label>
          <label className="field field-wide">
            <span>External reference</span>
            <input
              value={form.externalRef}
              onChange={(event) => setForm({ ...form, externalRef: event.target.value })}
              placeholder="Optional invoice or order number"
            />
          </label>

          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? "Generating..." : "Generate QR"}
          </button>
        </form>
        {status ? <p className="notice">{status}</p> : null}
      </section>

      <section className="panel stack-gap">
        <div className="panel-header">
          <h3>Current payment</h3>
          <span className={`status ${transaction?.status?.toLowerCase() || "pending"}`}>
            {transaction?.status || "IDLE"}
          </span>
        </div>
        {!transaction ? (
          <div className="empty-state">Generate a QR to see the live payment payload and status.</div>
        ) : (
          <>
            <div className="qr-preview">
              <div className="qr-glow" />
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <QRCodeSVG
                  value={transaction.qrString}
                  size={200}
                  bgColor="transparent"
                  fgColor="#eef5ff"
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-card">
                <span className="muted">Amount</span>
                <strong>{formatCurrency(transaction.amount, transaction.currency)}</strong>
              </div>
              <div className="detail-card">
                <span className="muted">Reference</span>
                <strong>{transaction.externalRef}</strong>
              </div>
              <div className="detail-card">
                <span className="muted">MD5 Hash</span>
                <strong className="hash">{transaction.md5Hash}</strong>
              </div>
              <div className="detail-card">
                <span className="muted">Confirmed</span>
                <strong>{formatDateTime(transaction.confirmedAt)}</strong>
              </div>
            </div>
          </>
        )}
      </section>
    </section>
  );
}

