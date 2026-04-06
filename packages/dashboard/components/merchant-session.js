"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, getSessionStorageKey } from "../lib/api";

const MerchantSessionContext = createContext(null);

export function MerchantSessionProvider({ children }) {
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshMerchants(preferredMerchantId) {
    try {
      setError("");
      const data = await apiRequest("/api/merchant");
      const nextMerchants = data.merchants || [];
      setMerchants(nextMerchants);

      const nextSelectedId =
        preferredMerchantId ||
        selectedMerchantId ||
        nextMerchants[0]?.id ||
        "";

      if (nextSelectedId) {
        setSelectedMerchantId(nextSelectedId);
        const selected = nextMerchants.find((merchant) => merchant.id === nextSelectedId);
        if (selected?.apiKey) {
          setApiKey(selected.apiKey);
        }
      }
    } catch (requestError) {
      if (requestError.message.includes("401")) {
        setApiKey("");
        setSelectedMerchantId("");
        window.localStorage.removeItem(getSessionStorageKey());
      }
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const raw = window.localStorage.getItem(getSessionStorageKey());
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.selectedMerchantId) {
          setSelectedMerchantId(parsed.selectedMerchantId);
        }
        if (parsed.apiKey) {
          setApiKey(parsed.apiKey);
        }
      } catch {
        window.localStorage.removeItem(getSessionStorageKey());
      }
    }

    refreshMerchants();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      getSessionStorageKey(),
      JSON.stringify({ selectedMerchantId, apiKey }),
    );
  }, [selectedMerchantId, apiKey]);

  const selectedMerchant = useMemo(
    () => merchants.find((merchant) => merchant.id === selectedMerchantId) || null,
    [merchants, selectedMerchantId],
  );

  return (
    <MerchantSessionContext.Provider
      value={{
        apiKey,
        error,
        loading,
        merchants,
        refreshMerchants,
        selectedMerchant,
        selectedMerchantId,
        setApiKey,
        setSelectedMerchantId,
      }}
    >
      {children}
    </MerchantSessionContext.Provider>
  );
}

export function useMerchantSession() {
  const value = useContext(MerchantSessionContext);
  if (!value) {
    throw new Error("useMerchantSession must be used within MerchantSessionProvider.");
  }
  return value;
}

