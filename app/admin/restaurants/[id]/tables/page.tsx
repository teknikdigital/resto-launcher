"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChair } from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MANUAL_TABLE_STATUS_LABELS, type ManualTableStatus, type Order, type Restaurant, type RestaurantTable } from "@/lib/resto-types";

const inputCls = "field";

export default function TablesAdminPage() {
  const { id } = useParams<{ id: string }>();
  return <TablesManager restaurantId={id} />;
}

export function TablesManager({ restaurantId: id, backHref, backLabel }: { restaurantId: string; backHref?: string; backLabel?: string }) {
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
  // Batch 2 Table Management, irisan 1: status meja live dari pesanan aktif.
  // Meja "Terisi" = punya pesanan berstatus baru/dikonfirmasi (belum selesai/batal).
  // Tanpa migrasi database: status dihitung dari tabel orders yang sudah ada.
  const [activeCounts, setActiveCounts] = useState<Record<string, number> | null>(null);
  const [statusFailed, setStatusFailed] = useState(false);
  // Batch 2 Table Management, irisan 2: tanda manual + tampilan denah.
  // Tanda manual mengalahkan badge live; denah = grid kartu warna status
  // (urut nama meja, belum posisi seret).
  const [view, setView] = useState<"daftar" | "denah">("daftar");
  const [manualSavingId, setManualSavingId] = useState<string | null>(null);

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
    // Status meja: gagal memuat pesanan tidak boleh merusak daftar meja.
    try {
      const oRes = await fetch(`/api/restaurants/${id}/orders`);
      const o = await oRes.json();
      if (!oRes.ok) throw new Error(o.error ?? "Gagal memuat pesanan");
      const counts: Record<string, number> = {};
      for (const order of o.orders as Order[]) {
        if ((order.status === "baru" || order.status === "dikonfirmasi") && order.table_id) {
          counts[order.table_id] = (counts[order.table_id] ?? 0) + 1;
        }
      }
      setActiveCounts(counts);
      setStatusFailed(false);
    } catch {
      setActiveCounts(null);
      setStatusFailed(true);
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

  // Status yang tampil: tanda manual mengalahkan hitungan live dari pesanan.
  // null = status belum bisa ditentukan (pesanan gagal dimuat & tanpa tanda).
  function displayStatus(t: RestaurantTable) {
    if (t.status_manual === "perlu_dibersihkan")
      return { label: "Perlu dibersihkan", badge: "bg-amber-100 text-amber-800", card: "border-amber-300 bg-amber-50" };
    if (t.status_manual === "rusak")
      return { label: "Rusak", badge: "bg-red-100 text-red-800", card: "border-red-300 bg-red-50" };
    if (!activeCounts) return null;
    const n = activeCounts[t.id] ?? 0;
    return n > 0
      ? { label: `Terisi · ${n} pesanan aktif`, badge: "bg-emerald-100 text-emerald-800", card: "border-emerald-300 bg-emerald-50" }
      : { label: "Kosong", badge: "bg-zinc-100 text-zinc-600", card: "border-zinc-200 bg-white" };
  }

  async function setManual(t: RestaurantTable, value: ManualTableStatus | "") {
    setManualSavingId(t.id);
    setError("");
    try {
      const res = await fetch(`/api/tables/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_manual: value === "" ? null : value }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Gagal menyimpan tanda");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan tanda");
    } finally {
      setManualSavingId(null);
    }
  }

  const manualSelect = (t: RestaurantTable) => (
    <label className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
      Tanda manual
      <select
        className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-800"
        value={t.status_manual ?? ""}
        disabled={manualSavingId === t.id}
        onChange={(e) => void setManual(t, e.target.value as ManualTableStatus | "")}
      >
        <option value="">Ikut status live</option>
        {(Object.keys(MANUAL_TABLE_STATUS_LABELS) as ManualTableStatus[]).map((k) => (
          <option key={k} value={k}>
            {MANUAL_TABLE_STATUS_LABELS[k]}
          </option>
        ))}
      </select>
      {manualSavingId === t.id && <span className="text-zinc-500">Menyimpan…</span>}
    </label>
  );

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
        <Link href={backHref ?? "/admin/restaurants"} className="back-link">
          {backLabel ?? "Kembali ke Restoran"}
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
      {tables.length > 0 && (
        <div className="panel mb-6 flex flex-wrap items-center justify-between gap-3">
          {activeCounts ? (
            <p className="text-sm text-zinc-700">
              <span className="font-semibold text-zinc-900">
                {tables.filter((t) => (activeCounts[t.id] ?? 0) > 0).length} dari {tables.length} meja terisi
              </span>
              {" · "}
              {Object.values(activeCounts).reduce((a, b) => a + b, 0)} pesanan aktif
              <span className="text-zinc-500"> (status dihitung dari pesanan yang belum selesai/batal)</span>
            </p>
          ) : statusFailed ? (
            <p className="text-sm text-zinc-500">Status meja belum bisa dimuat — daftar meja tetap bisa dikelola.</p>
          ) : (
            <p className="text-sm text-zinc-500">Memuat status meja…</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setView("daftar")} className={view === "daftar" ? "btn-primary btn-sm" : "btn-secondary btn-sm"}>
              Daftar
            </button>
            <button onClick={() => setView("denah")} className={view === "denah" ? "btn-primary btn-sm" : "btn-secondary btn-sm"}>
              Denah
            </button>
            <button onClick={() => void load()} className="btn-secondary btn-sm">
              Perbarui status
            </button>
          </div>
        </div>
      )}
      {loading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Memuat">
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-full" />
        </div>
      ) : tables.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon text-zinc-400"><FontAwesomeIcon icon={faChair} /></div>
          <p className="font-semibold text-zinc-800">Belum ada meja</p>
          <p className="mt-1 text-sm text-zinc-500">Tambahkan meja agar tiap meja punya link menu QR sendiri.</p>
        </div>
      ) : view === "denah" ? (
        <div>
          <p className="mb-3 flex flex-wrap gap-2 text-xs text-zinc-600">
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">Terisi</span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-600">Kosong</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">Perlu dibersihkan</span>
            <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-800">Rusak</span>
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {tables.map((t) => {
              const st = displayStatus(t);
              return (
                <div key={t.id} className={`rounded-xl border p-4 text-sm shadow-sm ${st?.card ?? "border-zinc-200 bg-white"}`}>
                  <p className="text-base font-semibold text-zinc-900">Meja {t.name}</p>
                  <p className="text-xs text-zinc-500">{t.seats ? `${t.seats} kursi` : "Kursi tidak diisi"}</p>
                  {st ? (
                    <p className="mt-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${st.badge}`}>{st.label}</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-zinc-500">{statusFailed ? "Status belum bisa dimuat" : "Memuat status…"}</p>
                  )}
                  <div className="mt-3">{manualSelect(t)}</div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Denah ini susunan grid menurut nama meja — belum posisi seret. QR dan link tiap meja tetap ada di tampilan Daftar.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tables.map((t) => {
            const st = displayStatus(t);
            return (
            <li key={t.id} className="rounded-xl border border-zinc-200 bg-white p-4 text-sm shadow-sm transition hover:shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-semibold text-zinc-900">
                  Meja {t.name} <span className="text-sm font-normal text-zinc-500">{t.seats ? `· ${t.seats} kursi` : ""}</span>
                  {st && (
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${st.badge}`}>{st.label}</span>
                  )}
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
              <div className="mt-2">{manualSelect(t)}</div>
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
            );
          })}
        </ul>
      )}
    </main>
  );
}
