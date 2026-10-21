"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatRupiah, type MenuItem, type VariantGroup, type MenuAddon } from "@/lib/resto-types";

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
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
  const [addonRows, setAddonRows] = useState<MenuAddon[]>([]);
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
    // Buang grup varian / opsi / add-on yang kosong sebelum dikirim.
    const variants = variantGroups
      .map((g) => ({
        label: g.label.trim(),
        options: g.options
          .filter((o) => o.name.trim())
          .map((o) => ({ name: o.name.trim(), price_delta: Math.max(0, Number(o.price_delta) || 0) })),
      }))
      .filter((g) => g.label && g.options.length > 0);
    if (variantGroups.some((g) => g.options.length > 0 && g.options.some((o) => !o.name.trim()))) {
      setError("Ada opsi varian yang namanya kosong — isi atau kosongkan seluruh barisnya.");
      return;
    }
    const addons = addonRows
      .filter((a) => a.name.trim())
      .map((a) => ({ name: a.name.trim(), price: Math.max(0, Number(a.price) || 0) }));
    const res = await fetch(editingId ? `/api/menu/${editingId}` : `/api/restaurants/${id}/menu`, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price), sort_order: Number(form.sort_order), variants, addons }),
    });
    const d = await res.json();
    if (!res.ok) {
      setError(d.error ?? "Gagal menyimpan menu");
      return;
    }
    setEditingId(null);
    setForm(EMPTY);
    setVariantGroups([]);
    setAddonRows([]);
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
    setVariantGroups(Array.isArray(m.variants) ? m.variants : []);
    setAddonRows(Array.isArray(m.addons) ? m.addons : []);
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

        <div className="rounded-xl border border-zinc-200 p-3 sm:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-semibold">Varian (pilihan wajib, mis. Ukuran / Level Pedas)</p>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => setVariantGroups((gs) => [...gs, { label: "", options: [{ name: "", price_delta: 0 }] }])}
            >
              + Grup Varian
            </button>
          </div>
          <p className="mb-2 text-xs text-zinc-500">Harga dasar menu + tambahan harga opsi. Opsi pertama jadi pilihan bawaan.</p>
          {variantGroups.map((g, gi) => (
            <div key={gi} className="mb-3 rounded-lg bg-zinc-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <input
                  className={inputCls}
                  placeholder="Nama grup (Ukuran)"
                  value={g.label}
                  onChange={(e) => setVariantGroups((gs) => gs.map((x, i) => (i === gi ? { ...x, label: e.target.value } : x)))}
                />
                <button
                  type="button"
                  className="btn-danger btn-sm shrink-0"
                  onClick={() => setVariantGroups((gs) => gs.filter((_, i) => i !== gi))}
                >
                  Hapus Grup
                </button>
              </div>
              {g.options.map((o, oi) => (
                <div key={oi} className="mb-1.5 flex items-center gap-2">
                  <input
                    className={inputCls}
                    placeholder="Nama opsi (Besar)"
                    value={o.name}
                    onChange={(e) =>
                      setVariantGroups((gs) =>
                        gs.map((x, i) => (i === gi ? { ...x, options: x.options.map((y, j) => (j === oi ? { ...y, name: e.target.value } : y)) } : x)),
                      )
                    }
                  />
                  <input
                    className={`${inputCls} !w-32`}
                    type="number"
                    min={0}
                    placeholder="+ Harga"
                    value={o.price_delta === 0 ? "" : String(o.price_delta)}
                    onChange={(e) =>
                      setVariantGroups((gs) =>
                        gs.map((x, i) => (i === gi ? { ...x, options: x.options.map((y, j) => (j === oi ? { ...y, price_delta: Number(e.target.value) || 0 } : y)) } : x)),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="btn-secondary btn-sm shrink-0"
                    onClick={() =>
                      setVariantGroups((gs) => gs.map((x, i) => (i === gi ? { ...x, options: x.options.filter((_, j) => j !== oi) } : x)))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-secondary btn-sm mt-1"
                onClick={() =>
                  setVariantGroups((gs) => gs.map((x, i) => (i === gi ? { ...x, options: [...x.options, { name: "", price_delta: 0 }] } : x)))
                }
              >
                + Opsi
              </button>
            </div>
          ))}

          <div className="mt-4 mb-1 flex items-center justify-between">
            <p className="text-sm font-semibold">Add-on (tambahan berbayar, boleh pilih banyak)</p>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => setAddonRows((as) => [...as, { name: "", price: 0 }])}
            >
              + Add-on
            </button>
          </div>
          {addonRows.map((a, ai) => (
            <div key={ai} className="mb-1.5 flex items-center gap-2">
              <input
                className={inputCls}
                placeholder="Nama add-on (Ekstra Telur)"
                value={a.name}
                onChange={(e) => setAddonRows((as) => as.map((x, i) => (i === ai ? { ...x, name: e.target.value } : x)))}
              />
              <input
                className={`${inputCls} !w-32`}
                type="number"
                min={0}
                placeholder="Harga"
                value={a.price === 0 ? "" : String(a.price)}
                onChange={(e) => setAddonRows((as) => as.map((x, i) => (i === ai ? { ...x, price: Number(e.target.value) || 0 } : x)))}
              />
              <button
                type="button"
                className="btn-secondary btn-sm shrink-0"
                onClick={() => setAddonRows((as) => as.filter((_, i) => i !== ai))}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 sm:col-span-2">
          <button className="btn-primary">
            {editingId ? "Simpan perubahan" : "Tambah"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY); setVariantGroups([]); setAddonRows([]); }} className="btn-secondary">
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
          <div className="empty-state-icon text-zinc-400"><FontAwesomeIcon icon={faClipboardList} /></div>
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
                <th>Tersedia / Habis</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id} className={m.is_available ? "" : "opacity-60"}>
                  <td className="text-zinc-500">{m.category ?? "-"}</td>
                  <td className="font-medium text-zinc-900">
                    {m.name}
                    {!m.is_available && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">Habis</span>}
                    {(m.variants?.length || m.addons?.length) ? (
                      <span className="ml-2 rounded-full bg-[#C9A227]/15 px-2 py-0.5 text-[11px] font-semibold text-[#8a6d1c]">
                        {m.variants?.length ? `${m.variants.length} grup varian` : ""}
                        {m.variants?.length && m.addons?.length ? " · " : ""}
                        {m.addons?.length ? `${m.addons.length} add-on` : ""}
                      </span>
                    ) : null}
                  </td>
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
