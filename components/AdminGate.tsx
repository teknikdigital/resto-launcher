"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Gerbang PIN admin: halaman operator hanya tampil setelah PIN terverifikasi.
// Polanya sama seperti OwnerGate/StaffGate. Sesi disimpan di sessionStorage
// (hilang saat tab ditutup), jadi PIN harus dimasukkan lagi di tab baru.
// Halaman staf (kasir, POS, dapur, struk) dilewati gerbang ini karena mereka
// sudah punya gerbang PIN per peran sendiri (StaffGate).
const STAFF_PATHS = ["/kasir", "/pos", "/dapur", "/struk"];

function AdminGateInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ok, setOk] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("admin_ok") === "1") setOk(true);
    } catch {
      /* abaikan */
    }
  }, []);

  if (pathname && STAFF_PATHS.some((p) => pathname.includes(p))) {
    return <>{children}</>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "PIN salah");
      try {
        sessionStorage.setItem("admin_ok", "1");
      } catch {
        /* abaikan */
      }
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal verifikasi");
    } finally {
      setBusy(false);
    }
  }

  if (!ok) {
    return (
      <main className="mx-auto w-full max-w-sm px-4 py-16">
        <div className="panel text-center">
          <p className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-[#1B5E3B] font-display text-xl font-bold text-white">
            R
          </p>
          <h1 className="page-title mt-4">Masuk Admin</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Halaman ini hanya untuk tim RestoLauncher. Masukkan PIN admin.
          </p>
          <form onSubmit={submit} className="mt-5 space-y-3">
            <input
              className="field text-center text-xl tracking-[0.5em]"
              placeholder="••••••"
              type="password"
              autoComplete="off"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className="w-full rounded-xl bg-[#1B5E3B] py-3 font-semibold text-white hover:bg-[#14492e] disabled:opacity-60">
              {busy ? "Memeriksa…" : "Masuk"}
            </button>
          </form>
          <p className="mt-4 text-xs text-zinc-400">
            PIN diatur lewat env ADMIN_PIN di Vercel. Bila belum dipasang, halaman ini akan memberi tahu.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

export default function AdminGate({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AdminGateInner>{children}</AdminGateInner>
    </Suspense>
  );
}
