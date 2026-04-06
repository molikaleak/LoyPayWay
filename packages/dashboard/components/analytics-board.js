"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest, formatCurrency } from "../lib/api";
import { useMerchantSession } from "./merchant-session";

function groupDailyRevenue(transactions) {
  const map = new Map();
  transactions
    .filter((item) => item.status === "SUCCESS")
    .forEach((item) => {
      const key = new Date(item.createdAt).toLocaleDateString("en-CA");
      map.set(key, parseFloat(map.get(key) || 0) + parseFloat(item.amount || 0));
    });

  return [...map.entries()].map(([date, total]) => ({ date, total }));
}

export function AnalyticsBoard() {
  const { selectedMerchant } = useMerchantSession();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      if (!selectedMerchant?.id) {
        setTransactions([]);
        setStats(null);
        return;
      }

      const data = await apiRequest(`/api/qr/transactions?merchantId=${selectedMerchant.id}`);
      setTransactions(data.transactions || []);
      setStats(data.stats || null);
    }

    load().catch(() => {
      setTransactions([]);
      setStats(null);
    });
  }, [selectedMerchant?.id]);

  const series = useMemo(() => groupDailyRevenue(transactions), [transactions]);
  const peak = Math.max(...series.map((item) => item.total), 1);

  return (
    <section className="stack-gap">
      <section className="panel stack-gap">
        <div className="panel-header">
          <h2>Revenue pulse</h2>
          <span className="muted">Simple analytics that work without extra chart libraries</span>
        </div>
        <div className="chart-card">
          {series.length === 0 ? (
            <div className="empty-state">No successful transactions yet for analytics.</div>
          ) : (
            series.map((item) => (
              <div className="chart-row" key={item.date}>
                <span>{item.date}</span>
                <div className="chart-bar-wrap">
                  <div className="chart-bar" style={{ width: `${(item.total / peak) * 100}%` }} />
                </div>
                <strong>{formatCurrency(item.total)}</strong>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="metrics">
        <article className="metric">
          <span>Revenue</span>
          <strong>{formatCurrency(stats?.totalRevenue || 0)}</strong>
        </article>
        <article className="metric">
          <span>Conversion</span>
          <strong>
            {stats?.totalTransactions
              ? `${Math.round((stats.successfulTransactions / stats.totalTransactions) * 100)}%`
              : "0%"}
          </strong>
        </article>
        <article className="metric">
          <span>Pending queue</span>
          <strong>{stats?.pendingTransactions || 0}</strong>
        </article>
        <article className="metric">
          <span>Expired</span>
          <strong>{stats?.expiredTransactions || 0}</strong>
        </article>
      </section>
    </section>
  );
}

