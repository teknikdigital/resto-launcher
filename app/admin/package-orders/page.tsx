"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type PackageOrder = {
  id: string;
  package: string;
  billing_period: string | null;
  restaurant_name: string;
  owner_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
};

const PKG_LABEL: Record<string, string> = {
  basic: "Basic",
  plus: "Plus",
  premium: "Premium",
};

export default function PackageOrdersPage() {
  const [orders, setOrders] = useState<PackageOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/package-orders");
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal memuat pesanan paket");
      setOrders(d.orders ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="page-title">Pesanan Paket</h1>
        <div className="flex gap-4">
          <button onClick={load} className="back-link">
            Muat ulang
          </button>
          <Link href="/admin/restaurants" className="back-link">
            Restoran
          </Link>
        </div>
      </header>

      {loading && <p className="text-sm text-zinc-500">Memuat…</p>}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="panel text-center">
          <p className="font-medium">Belum ada pesanan paket.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Pesanan dari form landing page (<span className="font-mono">/</span> → pilih paket) akan muncul di sini.
          </p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs text-zinc-500 uppercase">
                <th className="px-3 py-2">Tanggal</th>
                <th className="px-3 py-2">Paket</th>
                <th className="px-3 py-2">Restoran</th>
                <th className="px-3 py-2">Pemilik</th>
                <th className="px-3 py-2">Kontak</th>
                <th className="px-3 py-2">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-zinc-100 align-top last:border-0">
                  <td className="px-3 py-2.5 whitespace-nowrap text-zinc-500">
                    {new Date(o.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      {PKG_LABEL[o.package] ?? o.package}
                    </span>{" "}
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                      {o.billing_period === "yearly" ? "Tahunan" : "Bulanan"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-semibold">{o.restaurant_name}</td>
                  <td className="px-3 py-2.5">{o.owner_name}</td>
                  <td className="px-3 py-2.5">
                    <a className="text-emerald-700 hover:underline" href={`https://wa.me/${o.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                      {o.phone}
                    </a>
                    {o.email && <div className="text-xs text-zinc-500">{o.email}</div>}
                    {o.address && <div className="max-w-[220px] text-xs text-zinc-500">{o.address}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-zinc-500">{o.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
