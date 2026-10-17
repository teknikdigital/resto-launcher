"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Restaurant, RestaurantTable } from "@/lib/resto-types";

const inputCls = "field";

export default function TablesAdminPage() {
  const { id } = useParams<{ id: string }>();
  const [slug, setSlug] = useState("");
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [seats, setSeats] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState("");
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const [tRes, rRes] = await Promise.all([fetch(`/api/restaurants/${id}/tables`), fetch("/api/restaurants")]);
      const t = await tRes.json();
      if (!tRes.ok) throw new Error(t.error ?? "Gagal memuat meja");
      setTables(t.tables);
      const r = await rRes.json();
      if (rRes.ok) setSlug((r.restaurants as Restaurant[]).find((x) => x.id === id)?.slug ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat meja");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  function reset() {
    setEditingId(null);
    setName("");
    setSeats("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(editingId ? `/api/tables/${editingId}` : `/api/restaurants/${id}/tables`, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, seats: seats === "" ? null : Number(seats) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal menyimpan meja");
      reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan meja");
    } finally {
      setSaving(false);
    }
  }

  async function remove(t: RestaurantTable) {
    if (!window.confirm(`Hapus ${t.name}?`)) return;
    setError("");
    const res = await fetch(`/api/tables/${t.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Gagal menghapus meja");
      return;
    }
    await load();
  }

  const linkPath = (t: RestaurantTable) => `/r/${slug}/menu?table=${encodeURIComponent(t.name)}`;

  // Buat gambar QR per meja (untuk dicetak & ditempel di meja).
  async function makeQr(t: RestaurantTable) {
    if (qrMap[t.id] || !slug) return;
    try {
      const { default: QRCode } = await import("qrcode");
      const url = await QRCode.toDataURL(`${window.location.origin}${linkPath(t)}`, { width: 240, margin: 2 });
      setQrMap((m) => ({ ...m, [t.id]: url }));
    } catch {
      setError("Gagal membuat QR meja");
    }
  }

  useEffect(() => {
    tables.forEach((t) => {
      void makeQr(t);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables, slug]);

  async function copy(t: RestaurantTable) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${linkPath(t)}`);
      setCopied(t.id);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setError("Gagal menyalin link");
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="page-title">Kelola Meja</h1>
        <Link href="/admin/restaurants" className="back-link">
          Kembali ke Restoran
        </Link>
      </header>

      <form onSubmit={submit} className="panel mb-6 flex flex-wrap items-end gap-3">
        <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-sm font-medium text-zinc-700">
          Nama meja
          <input required className={inputCls} placeholder="Contoh: 1 atau A3" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="flex w-24 flex-col gap-1 text-sm font-medium text-zinc-700">
          Kursi
          <input type="number" min={1} className={inputCls} placeholder="4" value={seats} onChange={(e) => setSeats(e.target.value)} />
        </label>
        <button disabled={saving} className="btn-primary">
          {saving ? "Menyimpan..." : editingId ? "Simpan" : "Tambah Meja"}
        </button>
        {editingId && (
          <button type="button" onClick={reset} className="btn-secondary">
            Batal
          </button>
        )}
      </form>

      {error && <p className="alert-error">{error}</p>}
      {loading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Memuat">
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-full" />
        </div>
      ) : tables.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🪑</div>
          <p className="font-semibold text-zinc-800">Belum ada meja</p>
          <p className="mt-1 text-sm text-zinc-500">Tambahkan meja agar tiap meja punya link menu QR sendiri.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tables.map((t) => (
            <li key={t.id} className="rounded-xl border border-zinc-200 bg-white p-4 text-sm shadow-sm transition hover:shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-semibold text-zinc-900">
                  Meja {t.name} <span className="text-sm font-normal text-zinc-500">{t.seats ? `· ${t.seats} kursi` : ""}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(t.id);
                      setName(t.name);
                      setSeats(t.seats ? String(t.seats) : "");
                    }}
                    className="btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                  <button onClick={() => remove(t)} className="btn-danger btn-sm">
                    Hapus
                  </button>
                </div>
              </div>
              {slug && (
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  {qrMap[t.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrMap[t.id]} alt={`QR Meja ${t.name}`} className="h-28 w-28 rounded-lg border border-zinc-200 bg-white" />
                  ) : (
                    <div className="skeleton h-28 w-28" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-2 text-xs">
                    <Link href={linkPath(t)} target="_blank" className="break-all text-blue-600 hover:underline">
                      {linkPath(t)}
                    </Link>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => copy(t)} className="btn-secondary btn-sm shrink-0 shadow-none">
                        {copied === t.id ? "Tersalin" : "Salin Link"}
                      </button>
                      {qrMap[t.id] && (
                        <a href={qrMap[t.id]} download={`qr-meja-${t.name}.png`} className="btn-secondary btn-sm shrink-0 shadow-none">
                          Unduh QR
                        </a>
                      )}
                    </div>
                    <p className="text-zinc-500">Cetak & tempel di meja — pelanggan scan untuk pesan.</p>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
