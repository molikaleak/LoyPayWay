"use client";

import { useEffect, useState } from "react";
import { apiRequest, formatCurrency, formatDateTime, formatRevenueByCurrency } from "../lib/api";
import { useMerchantSession } from "./merchant-session";
import { OnboardingCard } from "./onboarding-card";
import { TransactionDetailDrawer } from "./transaction-detail-drawer";

export function TransactionsDashboard() {
  const { apiKey, error: sessionError, selectedMerchant } = useMerchantSession();
  const [data, setData] = useState({
    transactions: [],
    stats: {
      totalTransactions: 0,
      successfulTransactions: 0,
      pendingTransactions: 0,
      expiredTransactions: 0,
      totalRevenue: 0,
      revenueByCurrency: {},
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!selectedMerchant?.id) {
        setLoading(false);
        return;
      }

      try {
        setError("");
        const response = await apiRequest(`/api/qr/transactions?merchantId=${selectedMerchant.id}`);
        if (active) {
          setData(response);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    const interval = window.setInterval(load, 4000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [selectedMerchant?.id]);

  // Auto-show onboarding if there is no merchant yet
  const needsOnboarding = !selectedMerchant || !apiKey;
  const revenueLines = formatRevenueByCurrency(data.stats.revenueByCurrency);

  return (
    <section className="stack-gap">
      <div className="hero hero-wide">
        <div className="hero-copy">
          <p className="eyebrow">Merchant Ops</p>
          <h2>Payment command center</h2>

        </div>
        <div className="hero-card">
          <span>Total revenue</span>
          <strong>{revenueLines.length > 0 ? revenueLines.join(" / ") : formatCurrency(0)}</strong>
          <small className="muted">{selectedMerchant ? selectedMerchant.accountId : "No merchant selected"}</small>
        </div>
      </div>

      <div className="metrics">
        <article className="metric">
          <span>Total</span>
          <strong>{data.stats.totalTransactions}</strong>
        </article>
        <article className="metric">
          <span>Success</span>
          <strong>{data.stats.successfulTransactions}</strong>
        </article>
        <article className="metric">
          <span>Pending</span>
          <strong>{data.stats.pendingTransactions}</strong>
        </article>
        <article className="metric">
          <span>Expired</span>
          <strong>{data.stats.expiredTransactions}</strong>
        </article>
      </div>

      {/* Always show Create Merchant button; auto-show onboarding card if no merchant exists */}
      {needsOnboarding ? (
        <OnboardingCard />
      ) : (
        <>
          {!showOnboarding ? (
            <button
              className="button"
              type="button"
              onClick={() => setShowOnboarding(true)}
              style={{ alignSelf: "flex-start" }}
            >
              + Create new merchant
            </button>
          ) : (
            <div className="stack-gap">
              <button
                className="button"
                type="button"
                onClick={() => setShowOnboarding(false)}
                style={{ alignSelf: "flex-start" }}
              >
                ✕ Close
              </button>
              <OnboardingCard />
            </div>
          )}
        </>
      )}

      {sessionError ? <p className="notice notice-danger">{sessionError}</p> : null}
      {error ? <p className="notice notice-danger">{error}</p> : null}

      <section className="panel">
        <div className="panel-header">
          <h3>Latest transactions</h3>
          <span className="muted">
            {loading ? "Loading..." : `${data.transactions.length} transaction(s) loaded`}
          </span>
        </div>
        <div className="table">
          <div className="table-row table-head">
            <span>Reference</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Created</span>
          </div>
          {data.transactions.map((transaction) => (
            <div className="table-row" key={transaction.id} onClick={() => setSelectedTransaction(transaction)}>
              <span title={transaction.externalRef || transaction.id} style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {transaction.externalRef || transaction.id.slice(0, 8)}
              </span>
              <span>{formatCurrency(transaction.amount, transaction.currency)}</span>
              <span className={`status ${transaction.status.toLowerCase()}`}>{transaction.status}</span>
              <span>{formatDateTime(transaction.createdAt)}</span>
            </div>
          ))}
          {!loading && data.transactions.length === 0 ? (
            <div className="empty-state">No transactions yet. Generate one from the QR page.</div>
          ) : null}
        </div>
      </section>

      <TransactionDetailDrawer 
        transaction={selectedTransaction} 
        onClose={() => setSelectedTransaction(null)} 
      />
    </section>
  );
}
