const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

export function getApiBase() {
  return API_BASE;
}

export function getSessionStorageKey() {
  return "loy-payway-session";
}

/**
 * Returns the saved API key from localStorage (if available).
 */
function getSavedApiKey() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getSessionStorageKey());
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.apiKey || null;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Makes an API request with automatic auth header injection.
 * If an Authorization header is already provided in options, it takes priority.
 * Otherwise, the saved API key from session is used automatically.
 */
export async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Auto-inject Authorization if not already provided
  if (!headers.Authorization && !headers.authorization) {
    const savedKey = getSavedApiKey();
    if (savedKey) {
      headers.Authorization = `Bearer ${savedKey}`;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof body === "object" ? body.error || "Request failed." : "Request failed.";
    throw new Error(message);
  }

  return body;
}

export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));
}

export function formatRevenueByCurrency(revenueByCurrency = {}) {
  return Object.entries(revenueByCurrency)
    .filter(([, amount]) => Number(amount || 0) > 0)
    .sort(([currencyA], [currencyB]) => currencyA.localeCompare(currencyB))
    .map(([currency, amount]) => formatCurrency(amount, currency));
}

export function formatDateTime(value) {
  if (!value) {
    return "N/A";
  }
  return new Date(value).toLocaleString();
}
