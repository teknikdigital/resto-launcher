"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles, faCheck, faUtensils } from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  subStatus,
  TEMPLATES,
  TEMPLATE_DESCRIPTIONS,
  TEMPLATE_LABELS,
  toTemplate,
  PACKAGE_LABELS,
  type Package,
  type RestaurantTemplate,
  type RestaurantWithSub,
} from "@/lib/resto-types";
import { isQrisPayload, qrisMerchantCity, qrisMerchantName } from "@/lib/qris";

type Form = {
  slug: string;
  name: string;
  description: string;
  logo_url: string;
  cover_url: string;
  address: string;
  phone: string;
  whatsapp: string;
  primary_color: string;
  maps_url: string;
  instagram: string;
  tiktok: string;
  opening_hours: string;
  about_text: string;
  template: RestaurantTemplate;
  qris_payload: string;
  package: Package;
  owner_pin: string;
  kasir_pin: string;
  dapur_pin: string;
  promo_title: string;
  promo_text: string;
  promo_image_url: string;
};

const EMPTY: Form = {
  slug: "",
  name: "",
  description: "",
  logo_url: "",
  cover_url: "",
  address: "",
  phone: "",
  whatsapp: "",
  primary_color: "#16a34a",
  maps_url: "",
  instagram: "",
  tiktok: "",
  opening_hours: "",
  about_text: "",
  template: "minimal",
  qris_payload: "",
  package: "basic",
  owner_pin: "",
  kasir_pin: "",
  dapur_pin: "",
  promo_title: "",
  promo_text: "",
  promo_image_url: "",
};

const PREVIEW: Record<RestaurantTemplate, string> = {
  minimal: "bg-white text-zinc-900 border-zinc-200",
  dark: "bg-zinc-950 text-amber-300 border-zinc-700 font-serif",
  bold: "bg-yellow-300 text-zinc-950 border-zinc-950 font-black uppercase",
  warm: "bg-amber-50 text-stone-800 border-amber-200 font-serif",
  amok: "bg-[#14231a] text-[#b08968] border-[#2d4a35] font-black uppercase tracking-tight",
  amak: "bg-zinc-950 text-[#c9a87c] border-zinc-700 font-serif",
  patachou: "bg-white text-zinc-900 border-[#f5c518] italic",
  elegan: "bg-[#FDF6EC] text-zinc-900 border-[#F0DFC0] font-serif",
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const inputCls = "field";

function TableSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Memuat">
      <div className="skeleton h-10 w-full" />
      <div className="skeleton h-16 w-full" />
      <div className="skeleton h-16 w-full" />
    </div>
  );
}

function statusLabel(r: RestaurantWithSub): string {
  const st = subStatus(r.subscription);
  if (st === "permanent") return "Permanen";
  if (st === "trial") {
    const d = new Date(r.subscription!.trial_ends_at!).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `Trial sampai ${d}`;
  }
  return "Kadaluarsa";
}

function AdminRestaurants() {
  const params = useSearchParams();
  const [list, setList] = useState<RestaurantWithSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Form>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState("");
  const [category, setCategory] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [qrisScanning, setQrisScanning] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/restaurants");
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal memuat restoran");
      setList(d.restaurants);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat restoran");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Prefill dari lead (/leads -> "Buatkan Website").
  useEffect(() => {
    const name = params.get("name");
    if (!name) return;
    const phone = params.get("phone") ?? "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      ...EMPTY,
      name,
      slug: slugify(name),
      address: params.get("address") ?? "",
      phone,
      whatsapp: phone,
      maps_url: params.get("maps_url") ?? "",
      cover_url: params.get("cover_url") ?? "",
    });
  }, [params]);

  function set<K extends keyof Form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function edit(r: RestaurantWithSub) {
    setEditingId(r.id);
    setForm({
      slug: r.slug,
      name: r.name,
      description: r.description ?? "",
      logo_url: r.logo_url ?? "",
      cover_url: r.cover_url ?? "",
      address: r.address ?? "",
      phone: r.phone ?? "",
      whatsapp: r.whatsapp ?? "",
      primary_color: r.primary_color ?? "#16a34a",
      maps_url: r.maps_url ?? "",
      instagram: r.instagram ?? "",
      tiktok: r.tiktok ?? "",
      opening_hours: r.opening_hours ?? "",
      about_text: r.about_text ?? "",
      template: toTemplate(r.template),
      qris_payload: r.qris_payload ?? "",
      package: (r.package as Package) ?? "basic",
      owner_pin: r.owner_pin ?? "",
      kasir_pin: r.kasir_pin ?? "",
      dapur_pin: r.dapur_pin ?? "",
      promo_title: r.promo_title ?? "",
      promo_text: r.promo_text ?? "",
      promo_image_url: r.promo_image_url ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copyLink(path: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(path);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setError("Gagal menyalin link");
    }
  }

  function reset() {
    setEditingId(null);
    setForm(EMPTY);
    setCategory("");
  }

  async function generateDescription() {
    setAiLoading(true);
    setError("");
    try {
      const res = await fetch("/api/restaurants/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, address: form.address, category }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal membuat deskripsi");
      set("description", d.description);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat deskripsi");
    } finally {
      setAiLoading(false);
    }
  }

  // Baca QRIS dari foto yang di-upload (decode di browser, tidak dikirim ke mana-mana).
  async function onQrisFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setQrisScanning(true);
    setError("");
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Browser tidak mendukung pembacaan gambar");
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { default: jsQR } = await import("jsqr");
      const code = jsQR(img.data, img.width, img.height);
      if (!code?.data || !isQrisPayload(code.data)) {
        throw new Error("QR di foto tidak terbaca sebagai QRIS. Pastikan foto QRIS-nya jelas dan tidak terpotong.");
      }
      set("qris_payload", code.data.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membaca QRIS dari foto");
    } finally {
      setQrisScanning(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(editingId ? `/api/restaurants/${editingId}` : "/api/restaurants", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Slug bentrok: isi form dengan saran agar tinggal disimpan ulang.
        if (res.status === 409 && typeof d.suggestion === "string") set("slug", d.suggestion);
        throw new Error(
          res.status === 409 || res.status === 400 ? (d.error ?? "Gagal menyimpan") : "Gagal menyimpan restoran. Coba lagi sebentar lagi.",
        );
      }
      reset();
      if (!editingId && d.slug_changed) {
        setSuccess(`Slug '${d.requested_slug}' sudah dipakai, jadi restoran disimpan dengan slug '${d.slug}' (/r/${d.slug}).`);
      } else if (!editingId && d.slug) {
        setSuccess(`Restoran disimpan dengan slug '${d.slug}' (/r/${d.slug}).`);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function subscription(id: string, action: "extend" | "upgrade") {
    setError("");
    const res = await fetch(`/api/restaurants/${id}/subscription/${action}`, { method: "POST" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Gagal memperbarui langganan");
      return;
    }
    await load();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="page-title">Restoran</h1>
        <div className="flex gap-4">
          <Link href="/admin/package-orders" className="back-link">
            Pesanan Paket
          </Link>
          <Link href="/leads" className="back-link">
            Leads
          </Link>
        </div>
      </header>

      <form onSubmit={submit} className="panel mb-8 grid gap-3 sm:grid-cols-2">
        <h2 className="text-lg font-semibold sm:col-span-2">{editingId ? "Edit restoran" : "Tambah restoran"}</h2>
        <input required className={inputCls} placeholder="Nama" value={form.name}
          onChange={(e) => {
            set("name", e.target.value);
            if (!editingId) set("slug", slugify(e.target.value));
          }} />
        <input required className={inputCls} placeholder="Slug (contoh: warung-bu-tini)" value={form.slug}
          onChange={(e) => set("slug", e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-zinc-600 sm:col-span-2">
          <span className="font-medium">Paket:</span>
          <select
            value={form.package}
            onChange={(e) => set("package", e.target.value as Package)}
            className={`${inputCls} w-auto`}
          >
            {(Object.keys(PACKAGE_LABELS) as Package[]).map((pk) => (
              <option key={pk} value={pk}>
                {PACKAGE_LABELS[pk]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <span className="font-medium">PIN Owner:</span>
          <input
            className={`${inputCls} w-28 font-mono`}
            placeholder="6 digit"
            inputMode="numeric"
            maxLength={8}
            value={form.owner_pin}
            onChange={(e) => set("owner_pin", e.target.value.replace(/\D/g, ""))}
          />
          <button
            type="button"
            onClick={() => set("owner_pin", String(Math.floor(100000 + Math.random() * 900000)))}
            className="btn-secondary btn-sm"
          >
            Acak
          </button>
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <span className="font-medium">PIN Kasir:</span>
          <input
            className={`${inputCls} w-28 font-mono`}
            placeholder="opsional"
            inputMode="numeric"
            maxLength={8}
            value={form.kasir_pin}
            onChange={(e) => set("kasir_pin", e.target.value.replace(/\D/g, ""))}
          />
          <button
            type="button"
            onClick={() => set("kasir_pin", String(Math.floor(100000 + Math.random() * 900000)))}
            className="btn-secondary btn-sm"
          >
            Acak
          </button>
          <span className="text-xs text-zinc-400">kosong = halaman kasir/POS terbuka</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <span className="font-medium">PIN Dapur:</span>
          <input
            className={`${inputCls} w-28 font-mono`}
            placeholder="opsional"
            inputMode="numeric"
            maxLength={8}
            value={form.dapur_pin}
            onChange={(e) => set("dapur_pin", e.target.value.replace(/\D/g, ""))}
          />
          <button
            type="button"
            onClick={() => set("dapur_pin", String(Math.floor(100000 + Math.random() * 900000)))}
            className="btn-secondary btn-sm"
          >
            Acak
          </button>
          <span className="text-xs text-zinc-400">kosong = layar dapur terbuka</span>
        </label>
        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-start">
          <textarea className={`${inputCls} sm:flex-1`} rows={3} placeholder="Deskripsi singkat (tampil di hero & halaman link IG)" value={form.description}
            onChange={(e) => set("description", e.target.value)} />
          <div className="flex flex-col gap-2 sm:w-56">
            <input className={inputCls} placeholder="Kategori (cth: kafe, bakso)" value={category}
              onChange={(e) => setCategory(e.target.value)} />
            <button type="button" onClick={generateDescription} disabled={aiLoading || !form.name.trim()}
              className="btn-ai">
              {aiLoading ? "Membuat..." : <><FontAwesomeIcon icon={faWandMagicSparkles} className="mr-1.5" />Buatkan Deskripsi AI</>}
            </button>
          </div>
        </div>
        <textarea className={`${inputCls} sm:col-span-2`} rows={3} placeholder="Tentang Kami (cerita restoran; kosongkan untuk memakai deskripsi)" value={form.about_text}
          onChange={(e) => set("about_text", e.target.value)} />
        <textarea className={`${inputCls} sm:col-span-2`} rows={3} placeholder={"Jam buka, satu baris per hari/rentang. Contoh:\nSenin - Jumat: 08.00 - 22.00\nSabtu - Minggu: 09.00 - 23.00"} value={form.opening_hours}
          onChange={(e) => set("opening_hours", e.target.value)} />
        <input className={inputCls} placeholder="Instagram (@username atau URL)" value={form.instagram}
          onChange={(e) => set("instagram", e.target.value)} />
        <input className={inputCls} placeholder="TikTok (@username atau URL)" value={form.tiktok}
          onChange={(e) => set("tiktok", e.target.value)} />
        <input className={inputCls} placeholder="URL logo" value={form.logo_url}
          onChange={(e) => set("logo_url", e.target.value)} />
        <div className="flex items-center gap-3 sm:col-span-2">
          <input className={inputCls} placeholder="Foto Sampul (URL)" value={form.cover_url}
            onChange={(e) => set("cover_url", e.target.value)} />
          {form.cover_url.trim() && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.cover_url.trim()} alt="Pratinjau sampul" className="h-10 w-16 shrink-0 rounded-md border border-zinc-200 object-cover" />
          )}
        </div>
        <input className={inputCls} placeholder="Alamat" value={form.address}
          onChange={(e) => set("address", e.target.value)} />
        <input className={inputCls} placeholder="Telepon" value={form.phone}
          onChange={(e) => set("phone", e.target.value)} />
        <input className={inputCls} placeholder="WhatsApp (08xx / 62xx)" value={form.whatsapp}
          onChange={(e) => set("whatsapp", e.target.value)} />
        <input className={`${inputCls} sm:col-span-2`} type="url" placeholder="Link Google Maps (opsional)" value={form.maps_url}
          onChange={(e) => set("maps_url", e.target.value)} />
        <input className={inputCls} placeholder="Banner promo: judul (opsional)" value={form.promo_title}
          onChange={(e) => set("promo_title", e.target.value)} />
        <input className={inputCls} placeholder="Banner promo: teks (opsional)" value={form.promo_text}
          onChange={(e) => set("promo_text", e.target.value)} />
        <input className={`${inputCls} sm:col-span-2`} placeholder="Banner promo: URL gambar (opsional)" value={form.promo_image_url}
          onChange={(e) => set("promo_image_url", e.target.value)} />
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 sm:col-span-2">
          <p className="text-sm font-medium text-zinc-700">QRIS statis restoran</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Upload foto QRIS milik restoran sekali saja. Sistem akan membuat nominal dinamis per pesanan dari QRIS ini.
            Uang pelanggan tetap langsung masuk ke rekening restoran.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="btn-secondary cursor-pointer">
              {qrisScanning ? "Membaca QR..." : "Upload Foto QRIS"}
              <input type="file" accept="image/*" className="hidden" onChange={onQrisFile} disabled={qrisScanning} />
            </label>
            {form.qris_payload && (
              <button type="button" onClick={() => set("qris_payload", "")} className="btn-danger btn-sm">
                Hapus QRIS
              </button>
            )}
          </div>
          {form.qris_payload && isQrisPayload(form.qris_payload) && (
            <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
              <FontAwesomeIcon icon={faCheck} className="mr-1 text-[#1B5E3B]" /> QRIS terbaca: {qrisMerchantName(form.qris_payload) ?? "-"}
              {qrisMerchantCity(form.qris_payload) ? ` · ${qrisMerchantCity(form.qris_payload)}` : ""}
            </p>
          )}
        </div>
        <label className="flex items-center gap-3 text-sm font-medium text-zinc-700">
          Warna utama
          <input
            className="h-9 w-14 cursor-pointer rounded-md border border-zinc-300 bg-white p-0.5"
            type="color"
            value={form.primary_color}
            onChange={(e) => set("primary_color", e.target.value)}
          />
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-medium text-zinc-700">Tema desain</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {TEMPLATES.map((tpl) => (
              <label
                key={tpl}
                className={`cursor-pointer rounded-xl border-2 p-1.5 transition hover:border-blue-300 ${form.template === tpl ? "border-blue-600 bg-blue-50" : "border-transparent"}`}
              >
                <input
                  type="radio"
                  name="template"
                  value={tpl}
                  checked={form.template === tpl}
                  onChange={() => set("template", tpl)}
                  className="sr-only"
                />
                <div className={`flex h-14 items-center justify-center rounded-lg border text-sm ${PREVIEW[tpl]}`}>
                  {TEMPLATE_LABELS[tpl]}
                </div>
                <p className="mt-1 text-center text-xs text-zinc-500">{TEMPLATE_DESCRIPTIONS[tpl]}</p>
              </label>
            ))}
          </div>
        </fieldset>
        {editingId && form.slug && (
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium text-zinc-700">
              Pratinjau tema terpilih{" "}
              <a href={`/r/${form.slug}/menu?tema=${form.template}`} target="_blank" rel="noreferrer" className="font-normal text-[#1B5E3B] underline-offset-2 hover:underline">
                (buka layar penuh ↗)
              </a>
            </p>
            <div className="flex justify-center rounded-[2rem] border-2 border-dashed border-[#D9C48F] bg-[#F6ECD2]/50 px-3 py-5">
              <div className="w-full max-w-[360px] overflow-hidden rounded-[2rem] border-[8px] border-stone-900 bg-white shadow-xl">
                <iframe
                  key={form.template}
                  src={`/r/${form.slug}/menu?tema=${form.template}`}
                  title="Pratinjau tema"
                  className="block h-[480px] w-full border-0"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-zinc-500">Pratinjau halaman menu dengan data restoran ini. Tema baru berlaku setelah perubahan disimpan.</p>
          </div>
        )}
        <div className="flex gap-2 sm:col-span-2">
          <button disabled={saving} className="btn-primary">
            {saving ? "Menyimpan..." : editingId ? "Simpan perubahan" : "Tambah"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="btn-secondary">
              Batal
            </button>
          )}
        </div>
      </form>

      {error && <p className="alert-error">{error}</p>}
      {success && (
        <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{success}</p>
      )}
      {loading ? (
        <TableSkeleton />
      ) : list.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon text-zinc-400"><FontAwesomeIcon icon={faUtensils} /></div>
          <p className="font-semibold text-zinc-800">Belum ada restoran</p>
          <p className="mt-1 text-sm text-zinc-500">Tambahkan restoran pertama lewat formulir di atas.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama &amp; Link QR</th>
                <th>Maps</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const st = subStatus(r.subscription);
                return (
                  <tr key={r.id} className="align-top">
                    <td className="min-w-[260px]">
                      <p className="font-semibold text-zinc-900">
                        {r.name}{" "}
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          {PACKAGE_LABELS[(r.package as Package) ?? "basic"]}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        Tema: <span className="font-medium text-zinc-700">{TEMPLATE_LABELS[toTemplate(r.template)]}</span>
                      </p>
                      {(
                        [
                          ["Landing", `/r/${r.slug}`],
                          ["Menu QR", `/r/${r.slug}/menu`],
                          ["Link IG", `/r/${r.slug}/link`],
                        ] as const
                      ).map(([label, path]) => (
                        <div key={path} className="mt-1 flex items-center gap-2 text-xs">
                          <span className="w-14 shrink-0 text-zinc-500">{label}</span>
                          <Link href={path} target="_blank" className="break-all text-blue-600 hover:underline">
                            {path}
                          </Link>
                          <button
                            type="button"
                            onClick={() => copyLink(path)}
                            className="btn-secondary btn-sm shrink-0 !px-1.5 !py-0.5 shadow-none"
                          >
                            {copied === path ? "Tersalin" : "Salin Link"}
                          </button>
                        </div>
                      ))}
                    </td>
                    <td>
                      {r.maps_url ? (
                        <a href={r.maps_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Maps
                        </a>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                          st === "expired" ? "bg-red-50 text-red-700" : st === "permanent" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {statusLabel(r)}
                      </span>
                    </td>
                    <td className="min-w-[220px]">
                      <div className="flex flex-wrap gap-1.5">
                        <Link href={`/admin/restaurants/${r.id}`} className="btn-success btn-sm">Dashboard</Link>
                        <button onClick={() => edit(r)} className="btn-secondary btn-sm">Edit</button>
                        <Link href={`/admin/restaurants/${r.id}/menu`} className="btn-secondary btn-sm">Menu</Link>
                        <Link href={`/admin/restaurants/${r.id}/orders`} className="btn-secondary btn-sm">Pesanan</Link>
                        <Link href={`/admin/restaurants/${r.id}/kasir`} className="btn-secondary btn-sm">Kasir</Link>
                        <Link href={`/admin/restaurants/${r.id}/tables`} className="btn-secondary btn-sm">Meja</Link>
                        {st !== "permanent" && (
                          <>
                            <button onClick={() => subscription(r.id, "extend")} className="btn-secondary btn-sm">
                              Perpanjang Trial
                            </button>
                            <button onClick={() => subscription(r.id, "upgrade")} className="btn-success btn-sm">
                              Jadikan Permanen
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-10">
          <TableSkeleton />
        </main>
      }
    >
      <AdminRestaurants />
    </Suspense>
  );
}
