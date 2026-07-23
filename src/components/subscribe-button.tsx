"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubscribeButton({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    if (!loggedIn) {
      router.push("/signup");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong starting checkout.");
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
        className="w-full rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Redirecting to checkout..." : "Subscribe Monthly"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
