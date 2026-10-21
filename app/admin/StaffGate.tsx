"use client";

import { useEffect, useState } from "react";

export type StaffRole = "kasir" | "dapur";
const ROLE_LABELS: Record<StaffRole, string> = { kasir: "Kasir", dapur: "Dapur" };

// Gerbang PIN staf per peran & restoran (pola sama seperti portal owner).
// Bila PIN peran belum dipasang, halaman langsung terbuka seperti sebelumnya.
// Sesi disimpan di sessionStorage per restoran+peran.
export default function StaffGate({
  restaurantId,
  role,
  children,
}: {
  restaurantId: string;
  role: StaffRole;
  children: React.ReactNode;
}) {
  const key = `staff_${role}_${restaurantId}`;
  const [state, setState] = useState<"check" | "open" | "locked">("check");
  const [restoName, setRestoName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    try {
      if (sessionStorage.getItem(key)) {
        setState("open");
        return;
      }
    } catch {
      /* abaikan */
    }
    (async () => {
      try {
        const res = await fetch(
          `/api/staff/verify?restaurant_id=${encodeURIComponent(restaurantId)}&role=${role}`,
        );
        const d = await res.json();
        if (!alive) return;
        if (res.ok) {
          setRestoName(d.name ?? "");
          setState(d.required ? "locked" : "open");
        } else {
          // Gagal memeriksa: jangan kunci staf keluar — buka saja.
          setState("open");
        }
      } catch {
        if (alive) setState("open");
      }
    })();
    return () => {
      alive = false;
    };
  }, [restaurantId, role, key]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/staff/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: restaurantId, role, pin }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "PIN salah");
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* abaikan */
      }
      setState("open");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal verifikasi");
    } finally {
      setBusy(false);
    }
  }

  if (state === "check") {
    return (
      <main className="mx-auto w-full max-w-sm px-4 py-16">
        <p className="text-center text-sm text-zinc-500">Memeriksa akses…</p>
      </main>
    );
  }

  if (state === "locked") {
    return (
      <main className="mx-auto w-full max-w-sm px-4 py-16">
        <div className="panel text-center">
          <p className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1B5E3B] font-display text-xl font-bold text-white">
            R
          </p>
          <h1 className="page-title mt-4">Akses {ROLE_LABELS[role]}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {restoName ? `${restoName} · ` : ""}Masukkan PIN {ROLE_LABELS[role].toLowerCase()} untuk membuka halaman ini.
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
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-[#1B5E3B] py-3 font-semibold text-white hover:bg-[#14492e] disabled:opacity-60"
            >
              {busy ? "Memeriksa…" : "Masuk"}
            </button>
          </form>
          <p className="mt-4 text-xs text-zinc-400">PIN diatur oleh pemilik/pengelola resto.</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
