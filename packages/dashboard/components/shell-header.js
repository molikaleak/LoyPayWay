"use client";

import { useMerchantSession } from "./merchant-session";

export function ShellHeader() {
  const { selectedMerchant, merchants, selectedMerchantId, setSelectedMerchantId, loading } =
    useMerchantSession();

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Loy Payway Gateway</p>
        <h2 className="topbar-title">{selectedMerchant?.name || "Choose a merchant"}</h2>
      </div>
      <div className="topbar-controls">
        <span className="mode-pill">{loading ? "Loading..." : "System Active"}</span>
        <select
          className="select"
          value={selectedMerchantId}
          onChange={(event) => setSelectedMerchantId(event.target.value)}
        >
          {merchants.length === 0 ? <option value="">No merchants yet</option> : null}
          {merchants.map((merchant) => (
            <option value={merchant.id} key={merchant.id}>
              {merchant.name}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}

