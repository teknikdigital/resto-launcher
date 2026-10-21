"use client";

import Link from "next/link";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faStar,
  faPhone,
  faLocationDot,
  faCheck,
  faBookmark,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";

type Place = {
  place_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  website: string | null;
  maps_url: string | null;
  photo_url: string | null;
};

const QUICK_QUERIES = ["cafe bandung", "restoran bandung", "kopi bandung", "bakso bandung", "rumah makan padang bandung"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [saved, setSaved] = useState<Record<string, "saving" | "saved">>({});

  async function runSearch(q: string) {
    if (!q.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Terjadi kesalahan");
      setPlaces(data.places);
      setSaved({});
      setSearched(true);
      if (data.places.length === 0) setError("Tidak ada hasil untuk kata kunci itu. Coba kata kunci lain.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  function search(e: React.FormEvent) {
    e.preventDefault();
    void runSearch(query);
  }

  async function save(place: Place) {
    setSaved((s) => ({ ...s, [place.place_id]: "saving" }));
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(place),
      });
      if (!res.ok) throw new Error();
      setSaved((s) => ({ ...s, [place.place_id]: "saved" }));
    } catch {
      setSaved((s) => {
        const next = { ...s };
        delete next[place.place_id];
        return next;
      });
      setError("Gagal menyimpan lead.");
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF6EF]">
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.25em] text-[#C9A227] uppercase">RestoLauncher · Alat Internal</p>
            <h1 className="font-display mt-1 text-3xl font-semibold text-zinc-900 sm:text-4xl">Cari Lead Restoran</h1>
            <p className="mt-1.5 max-w-lg text-sm text-zinc-500">
              Temukan restoran &amp; kafe calon pelanggan lewat Google Places, lalu simpan sebagai lead untuk dihubungi.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/leads" className="btn-secondary">
              <FontAwesomeIcon icon={faBookmark} className="mr-1.5" /> Daftar Leads
            </Link>
            <Link href="/admin/restaurants" className="btn-secondary">
              Admin Resto
            </Link>
          </div>
        </header>

        <section className="panel mb-6 !rounded-3xl">
          <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Contoh: "cafe bandung"'
                className="field !pl-10"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#1B5E3B] px-6 py-2.5 font-semibold text-white transition hover:bg-[#14492e] disabled:opacity-50"
            >
              {loading ? "Mencari…" : "Cari"}
            </button>
          </form>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-zinc-400">Coba cepat:</span>
            {QUICK_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuery(q);
                  void runSearch(q);
                }}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-[#1B5E3B] hover:text-[#1B5E3B]"
              >
                {q}
              </button>
            ))}
          </div>
        </section>

        {error && <p className="alert-error mb-4">{error}</p>}

        {loading && (
          <div className="space-y-3" aria-busy="true" aria-label="Mencari">
            <div className="skeleton h-28 w-full !rounded-3xl" />
            <div className="skeleton h-28 w-full !rounded-3xl" />
            <div className="skeleton h-28 w-full !rounded-3xl" />
          </div>
        )}

        {!loading && searched && places.length > 0 && (
          <p className="mb-3 text-sm font-medium text-zinc-500">
            {places.length} hasil ditemukan — simpan yang menarik sebagai lead.
          </p>
        )}

        {!loading && !searched && (
          <div className="rounded-3xl border-2 border-dashed border-[#1B5E3B]/25 px-6 py-14 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B5E3B]/10 text-xl text-[#1B5E3B]">
              <FontAwesomeIcon icon={faUtensils} />
            </div>
            <p className="font-display text-lg font-semibold text-zinc-800">Mulai dari kata kunci</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
              Ketik jenis usaha + kota, misalnya &quot;cafe bandung&quot; atau &quot;bakso jakarta&quot;, lalu tekan Cari.
            </p>
          </div>
        )}

        <ul className="space-y-3">
          {places.map((p) => {
            const state = saved[p.place_id];
            return (
              <li key={p.place_id} className="panel flex items-start gap-4 !rounded-3xl transition hover:shadow-md">
                {p.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${p.photo_url}&w=240`} alt="" loading="lazy" className="h-24 w-24 shrink-0 rounded-2xl object-cover" />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#1B5E3B]/10 font-display text-2xl font-bold text-[#1B5E3B]">
                    {p.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg leading-snug font-semibold text-zinc-900">{p.name}</h2>
                  <p className="mt-0.5 flex items-start gap-1.5 text-sm text-zinc-500">
                    <FontAwesomeIcon icon={faLocationDot} className="mt-0.5 shrink-0 text-[#C9A227]" />
                    <span>{p.address ?? "-"}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600">
                    <span className="inline-flex items-center gap-1">
                      <FontAwesomeIcon icon={faStar} className="text-[#C9A227]" />
                      <strong>{p.rating ?? "-"}</strong>
                      {p.user_ratings_total ? <span className="text-zinc-400">({p.user_ratings_total} ulasan)</span> : null}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faPhone} className="text-xs text-zinc-400" />
                      {p.phone ?? "-"}
                    </span>
                    {p.maps_url && (
                      <a href={p.maps_url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#1B5E3B] hover:underline">
                        Lihat di Maps ↗
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => save(p)}
                  disabled={!!state}
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    state === "saved"
                      ? "cursor-default bg-[#1B5E3B] text-white"
                      : "border border-[#1B5E3B] text-[#1B5E3B] hover:bg-[#1B5E3B] hover:text-white disabled:opacity-60"
                  }`}
                >
                  {state === "saved" ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="mr-1.5" /> Tersimpan
                    </>
                  ) : state === "saving" ? (
                    "Menyimpan…"
                  ) : (
                    "Simpan Lead"
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
