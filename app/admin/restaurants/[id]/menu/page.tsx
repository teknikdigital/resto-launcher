"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatRupiah, type MenuItem } from "@/lib/resto-types";

type Form = {
  category: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  sort_order: string;
};

type Draft = { category: string; name: string; description: string; price: string };

const EMPTY: Form = { category: "", name: "", description: "", price: "", image_url: "", sort_order: "0" };
const inputCls = "field";

export default function MenuAdminPage() {
  const { id } = useParams<{ id: string }>();
  return <MenuManager restaurantId={id} />;
}

export function MenuManager({ restaurantId: id, backHref, backLabel }: { restaurantId: string; backHref?: string; backLabel?: string }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Form>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/restaurants/${id}/menu`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal memuat menu");
      setItems(d.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat menu");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setExtracting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/menu/extract", { method: "POST", body: fd });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Gagal mengekstrak menu");
      setDrafts(
        (d.items as Draft[]).map((it) => ({
          category: it.category ?? "",
          name: it.name ?? "",
          description: it.description ?? "",
          price: String(it.price ?? 0),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengekstrak menu");
    } finally {
      setExtracting(false);
    }
  }

  function setDraft(i: number, k: keyof Draft, v: string) {
    setDrafts((ds) => ds.map((d, idx) => (idx === i ? { ...d, [k]: v } : d)));
  }

  async function saveAll() {
    setSaving(true);
    setError("");
    const failed: Draft[] = [];
    let ok = 0;
    for (const d of drafts) {
      if (!d.name.trim()) continue;
      try {
        const res = await fetch(`/api/restaurants/${id}/menu`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: d.category, name: d.name, description: d.description, price: Number(d.price) || 0 }),
        });
        if (res.ok) ok++;
        else failed.push(d);
      } catch {
        failed.push(d);
      }
    }
    setDrafts(failed);
    setSaving(false);
    if (failed.length) setError(`${ok} item tersimpan, ${failed.length} gagal (tetap ditampilkan, coba simpan lagi).`);
    await load();
  }

  function set<K extends keyof Form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(editingId ? `/api/menu/${editingId}` : `/api/restaurants/${id}/menu`, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price), sort_order: Number(form.sort_order) }),
    });
    const d = await res.json();
    if (!res.ok) {
      setError(d.error ?? "Gagal menyimpan menu");
      return;
    }
    setEditingId(null);
    setForm(EMPTY);
    await load();
  }

  async function toggle(item: MenuItem) {
    const res = await fetch(`/api/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: !item.is_available }),
    });
    if (!res.ok) setError("Gagal mengubah ketersediaan");
    else await load();
  }

  async function remove(item: MenuItem) {
    if (!confirm(`Hapus menu "${item.name}"?`)) return;
    const res = await fetch(`/api/menu/${item.id}`, { method: "DELETE" });
    if (!res.ok) setError("Gagal menghapus menu");
    else await load();
  }

  function edit(m: MenuItem) {
    setEditingId(m.id);
    setForm({
      category: m.category ?? "",
      name: m.name,
      description: m.description ?? "",
      price: String(m.price),
      image_url: m.image_url ?? "",
      sort_order: String(m.sort_order ?? 0),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="page-title">Kelola Menu</h1>
        <Link href={backHref ?? "/admin/restaurants"} className="back-link">
          {backLabel ?? "Kembali ke Restoran"}
        </Link>
      </header>

      <section className="panel mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <label className="btn cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700">
            {extracting ? "Mengekstrak..." : "Upload Foto/PDF Menu"}
            <input type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" disabled={extracting} onChange={onUpload} />
          </label>
          <span className="text-xs text-zinc-500">JPG/PNG/PDF, maks 10 MB. Hasil AI bisa diedit sebelum disimpan.</span>
        </div>
        {drafts.length > 0 && (
          <div className="mt-4">
            <div className="table-wrap">
              <table className="data-table min-w-[720px]">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Deskripsi</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((d, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1"><input className={inputCls} value={d.name} onChange={(e) => setDraft(i, "name", e.target.value)} /></td>
                      <td className="px-2 py-1"><input className={inputCls} value={d.category} onChange={(e) => setDraft(i, "category", e.target.value)} /></td>
                      <td className="px-2 py-1"><input type="number" min={0} className={inputCls} value={d.price} onChange={(e) => setDraft(i, "price", e.target.value)} /></td>
                      <td className="px-2 py-1"><input className={inputCls} value={d.description} onChange={(e) => setDraft(i, "description", e.target.value)} /></td>
                      <td className="px-2 py-1">
                        <button type="button" onClick={() => setDrafts((ds) => ds.filter((_, idx) => idx !== i))} className="btn-danger btn-sm">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={saveAll} disabled={saving} className="btn-primary">
                {saving ? "Menyimpan..." : `Simpan Semua (${drafts.length})`}
              </button>
              <button type="button" onClick={() => setDrafts([])} disabled={saving} className="btn-secondary">
                Buang
              </button>
            </div>
          </div>
        )}
      </section>

      <form onSubmit={submit} className="panel mb-8 grid gap-3 sm:grid-cols-2">
        <h2 className="text-lg font-semibold sm:col-span-2">{editingId ? "Edit menu" : "Tambah menu"}</h2>
        <input required className={inputCls} placeholder="Nama menu" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <input className={inputCls} placeholder="Kategori (contoh: Makanan)" value={form.category} onChange={(e) => set("category", e.target.value)} />
        <input required type="number" min={0} className={inputCls} placeholder="Harga" value={form.price} onChange={(e) => set("price", e.target.value)} />
        <input type="number" className={inputCls} placeholder="Urutan" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
        <input className={inputCls} placeholder="URL gambar" value={form.image_url} onChange={(e) => set("image_url", e.target.value)} />
        <input className={inputCls} placeholder="Deskripsi" value={form.description} onChange={(e) => set("description", e.target.value)} />
        <div className="flex gap-2 sm:col-span-2">
          <button className="btn-primary">
            {editingId ? "Simpan perubahan" : "Tambah"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY); }} className="btn-secondary">
              Batal
            </button>
          )}
        </div>
      </form>

      {error && <p className="alert-error">{error}</p>}
      {loading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Memuat">
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-14 w-full" />
          <div className="skeleton h-14 w-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="font-semibold text-zinc-800">Belum ada menu</p>
          <p className="mt-1 text-sm text-zinc-500">Tambah menu lewat formulir di atas atau unggah foto/PDF menu.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table min-w-[560px]">
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Nama</th>
                <th>Harga</th>
                <th>Tersedia</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id}>
                  <td className="text-zinc-500">{m.category ?? "-"}</td>
                  <td className="font-medium text-zinc-900">{m.name}</td>
                  <td className="whitespace-nowrap">{formatRupiah(Number(m.price))}</td>
                  <td>
                    <input className="h-4 w-4 cursor-pointer accent-blue-600" type="checkbox" checked={m.is_available} onChange={() => toggle(m)} aria-label="Tersedia" />
                  </td>
                  <td className="whitespace-nowrap">
                    <div className="flex gap-1.5">
                      <button onClick={() => edit(m)} className="btn-secondary btn-sm">Edit</button>
                      <button onClick={() => remove(m)} className="btn-danger btn-sm">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
