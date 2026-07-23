"use client";

import { useState } from "react";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not open billing portal.");
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  };

  return (
    <div>
      <button
        onClick={onClick}
        disabled={loading}
        className="rounded-full border border-black/10 px-5 py-2.5 font-semibold hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/5"
      >
        {loading ? "Opening billing portal..." : "Manage Billing"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
