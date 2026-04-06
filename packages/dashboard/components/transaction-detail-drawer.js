"use client";

import { formatCurrency, formatDateTime } from "../lib/api";

export function TransactionDetailDrawer({ transaction, onClose }) {
  if (!transaction) return null;

  return (
    <div 
      className={`drawer-overlay ${transaction ? "active" : ""}`} 
      onClick={onClose}
    >
      <div 
        className="drawer-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer-header">
          <div>
            <span className="eyebrow">Transaction Detail</span>
            <div className="drawer-amount">
              {formatCurrency(transaction.amount, transaction.currency)}
            </div>
            <span className={`status-badge-premium ${transaction.status.toLowerCase()}`}>
              {transaction.status}
            </span>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="drawer-body">
          <section className="drawer-section">
            <h4>IDENTIFIER</h4>
            <div className="credential-card">
              <span className="muted">Transaction ID</span>
              <code className="hash" style={{ fontSize: "0.9rem" }}>{transaction.id}</code>
            </div>
            {transaction.externalRef && (
              <div className="credential-card">
                <span className="muted">External Reference</span>
                <code className="hash" style={{ fontSize: "0.9rem" }}>{transaction.externalRef}</code>
              </div>
            )}
          </section>

          <section className="drawer-section">
            <h4>TIMELINE</h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">Created At</span>
                <span>{formatDateTime(transaction.createdAt)}</span>
              </div>
              {transaction.confirmedAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Confirmed At</span>
                  <span>{formatDateTime(transaction.confirmedAt)}</span>
                </div>
              )}
            </div>
          </section>

          <section className="drawer-section">
            <h4>TECHNICAL DATA</h4>
            <div className="technical-box">
              <pre style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>
                {JSON.stringify({
                  md5Hash: transaction.md5Hash,
                  fromAccountId: transaction.fromAccountId || "N/A",
                  demoMode: transaction.demoAutoConfirm || false,
                }, null, 2)}
              </pre>
            </div>
          </section>
        </div>

        <footer className="drawer-footer">
          <button className="button button-primary" style={{ width: '100%' }}>
            Download Receipt
          </button>
          <button className="button" style={{ width: '100%' }} onClick={() => alert('Refund process initiated')}>
            Issue Refund
          </button>
        </footer>
      </div>
    </div>
  );
}
