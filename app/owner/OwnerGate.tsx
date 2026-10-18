"use client";

import { useEffect, useState } from "react";

export type OwnerAuth = { id: string; name: string };

// Gerbang PIN portal owner: children hanya tampil setelah PIN terverifikasi.
// Sesi disimpan di sessionStorage per slug (hilang saat tab ditutup).
export default function OwnerGate({
  slug,
  children,
}: {
  slug: string;
  children: (auth: OwnerAuth) => React.ReactNode;
}) {
  const [auth, setAuth] = useState<OwnerAuth | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`owner_${slug}`);
      if (raw) setAuth(JSON.parse(raw));
    } catch {
      /* abaikan */
    }
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/owner/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, pin }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "PIN salah");
      const a: OwnerAuth = { id: d.restaurant.id, name: d.restaurant.name };
      sessionStorage.setItem(`owner_${slug}`, JSON.stringify(a));
      setAuth(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal verifikasi");
    } finally {
      setBusy(false);
    }
  }

  if (!auth) {
    return (
      <main className="mx-auto w-full max-w-sm px-4 py-16">
        <div className="panel text-center">
          <p className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-[#1B5E3B] font-display text-xl font-bold text-white">
            R
          </p>
          <h1 className="page-title mt-4">Portal Owner</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Masukkan PIN restoramu untuk mengelola meja & menu.
          </p>
          <form onSubmit={submit} className="mt-5 space-y-3">
            <input
              className="field text-center text-xl tracking-[0.5em]"
              placeholder="••••••"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className="w-full rounded-xl bg-[#1B5E3B] py-3 font-semibold text-white hover:bg-[#14492e] disabled:opacity-60">
              {busy ? "Memeriksa…" : "Masuk"}
            </button>
          </form>
          <p className="mt-4 text-xs text-zinc-400">PIN diberikan saat setup. Hubungi tim RestoLauncher bila lupa.</p>
        </div>
      </main>
    );
  }

  return <>{children(auth)}</>;
}
