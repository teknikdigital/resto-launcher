"use client";

import { Suspense } from "react";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Restaurant } from "@/lib/resto-types";
import OwnerGate from "../../OwnerGate";

const inputCls = "field";

// Halaman profil: owner bisa edit tulisan & info restonya sendiri.
// Logo/foto sampul: tempel URL gambar, atau kirim via WA ke tim kami.
function OwnerProfilInner() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <OwnerGate slug={slug}>
      {(auth) => <ProfilForm restaurantId={auth.id} slug={slug} />}
    </OwnerGate>
  );
}

function ProfilForm({ restaurantId, slug }: { restaurantId: string; slug: string }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    opening_hours: "",
    maps_url: "",
    logo_url: "",
    cover_url: "",
    promo_title: "",
    promo_text: "",
    promo_image_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/restaurants");
        const d = await res.json();
        const r = (d.restaurants as Restaurant[]).find((x) => x.id === restaurantId);
        if (r) {
          setForm({
            name: r.name ?? "",
            description: r.description ?? "",
            address: r.address ?? "",
            phone: r.phone ?? "",
            opening_hours: r.opening_hours ?? "",
            maps_url: r.maps_url ?? "",
            logo_url: r.logo_url ?? "",
            cover_url: r.cover_url ?? "",
            promo_title: r.promo_title ?? "",
            promo_text: r.promo_text ?? "",
            promo_image_url: r.promo_image_url ?? "",
          });
        }
      } catch {
        setMsg("Gagal memuat data resto");
      } finally {
        setLoading(false);
      }
    })();
  }, [restaurantId]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal menyimpan");
      setMsg("✅ Tersimpan! Lihat hasilnya di website restomu.");
    } catch (err) {
      setMsg(`❌ ${err instanceof Error ? err.message : "Gagal menyimpan"}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="mx-auto max-w-2xl px-4 py-10"><p className="text-zinc-500">Memuat…</p></main>;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <a href={`/owner/${slug}`} className="back-link">← Portal Owner</a>
      <h1 className="page-title mt-2">Profil Resto</h1>
      <p className="mt-1 text-sm text-zinc-500">Ubah tulisan & info yang tampil di website restomu.</p>
      <form onSubmit={save} className="panel mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Nama resto</label>
          <input className={inputCls} value={form.name} onChange={set("name")} required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Deskripsi / tentang resto</label>
          <textarea className={inputCls} rows={3} value={form.description} onChange={set("description")}
            placeholder="Ceritakan singkat tentang restomu…" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Alamat</label>
            <input className={inputCls} value={form.address} onChange={set("address")} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">No. WhatsApp / telepon</label>
            <input className={inputCls} value={form.phone} onChange={set("phone")} placeholder="08…" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Jam buka</label>
            <input className={inputCls} value={form.opening_hours} onChange={set("opening_hours")} placeholder="09.00 – 21.00" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Link Google Maps</label>
            <input className={inputCls} value={form.maps_url} onChange={set("maps_url")} placeholder="https://maps…" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Logo (URL gambar)</label>
            <input className={inputCls} value={form.logo_url} onChange={set("logo_url")} placeholder="https://…" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Foto sampul (URL gambar)</label>
            <input className={inputCls} value={form.cover_url} onChange={set("cover_url")} placeholder="https://…" />
          </div>
        </div>
        <div className="rounded-xl border border-[#C9A227]/40 bg-[#C9A227]/5 p-4">
          <p className="text-sm font-semibold">Banner Promo</p>
          <p className="mb-3 mt-0.5 text-xs text-zinc-500">
            Tampil di bagian atas halaman menu restomu. Kosongkan semua bila tidak ada promo.
          </p>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Judul promo</label>
              <input className={inputCls} value={form.promo_title} onChange={set("promo_title")} placeholder="Promo Jumat: Diskon 20% Semua Menu" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Teks promo</label>
              <input className={inputCls} value={form.promo_text} onChange={set("promo_text")} placeholder="Berlaku dine-in, pukul 11.00–15.00" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Gambar promo (URL, opsional)</label>
              <input className={inputCls} value={form.promo_image_url} onChange={set("promo_image_url")} placeholder="https://…" />
            </div>
          </div>
        </div>
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <FontAwesomeIcon icon={faLightbulb} className="mr-1 text-amber-600" /> Belum punya link gambar? Kirim foto/logo via WhatsApp ke tim kami — kami yang pasangkan.
        </p>
        {msg && <p className="text-sm font-medium">{msg}</p>}
        <button type="submit" disabled={saving} className="rounded-xl bg-[#1B5E3B] px-6 py-3 font-semibold text-white hover:bg-[#14492e] disabled:opacity-60">
          {saving ? "Menyimpan…" : "Simpan Perubahan"}
        </button>
      </form>
    </main>
  );
}

export default function OwnerProfilPage() {
  return (
    <Suspense>
      <OwnerProfilInner />
    </Suspense>
  );
}
