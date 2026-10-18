"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Halaman masuk portal owner: slug resto + PIN.
export default function OwnerLoginPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const s = slug.trim().toLowerCase();
    if (!s || !pin.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/owner/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: s, pin }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Slug atau PIN salah");
      sessionStorage.setItem(`owner_${s}`, JSON.stringify({ id: d.restaurant.id, name: d.restaurant.name }));
      router.push(`/owner/${s}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-sm px-4 py-16">
      <div className="panel text-center">
        <p className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-[#1B5E3B] font-display text-xl font-bold text-white">
          R
        </p>
        <h1 className="page-title mt-4">Portal Owner</h1>
        <p className="mt-1 text-sm text-zinc-500">Kelola meja & menu restoranmu sendiri.</p>
        <form onSubmit={submit} className="mt-5 space-y-3 text-left">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Slug resto</label>
            <input
              className="field font-mono"
              placeholder="warung-bu-tini"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">PIN</label>
            <input
              className="field text-center text-xl tracking-[0.5em]"
              placeholder="••••••"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-xl bg-[#1B5E3B] py-3 font-semibold text-white hover:bg-[#14492e] disabled:opacity-60">
            {busy ? "Memeriksa…" : "Masuk"}
          </button>
        </form>
        <p className="mt-4 text-xs text-zinc-400">Slug & PIN diberikan saat setup. Hubungi tim RestoLauncher bila lupa.</p>
      </div>
    </main>
  );
}
