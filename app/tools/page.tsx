"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faStar,
  faPhone,
  faLocationDot,
  faCheck,
  faUtensils,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import LeadSidebar, { LEAD_STEPS } from "@/components/LeadSidebar";

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

type Filter = "semua" | "hp" | "rating";
type Sort = "relevan" | "rating" | "ulasan";

export default function Home() {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [saved, setSaved] = useState<Record<string, "saving" | "saved">>({});
  const [totalLeads, setTotalLeads] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("semua");
  const [sort, setSort] = useState<Sort>("relevan");

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.leads) setTotalLeads(data.leads.length);
      })
      .catch(() => {
        /* ringkasan saja — abaikan bila gagal */
      });
  }, []);

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
      setSearchedQuery(q);
      setFilter("semua");
      setSort("relevan");
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
      setTotalLeads((n) => (n === null ? n : n + 1));
    } catch {
      setSaved((s) => {
        const next = { ...s };
        delete next[place.place_id];
        return next;
      });
      setError("Gagal menyimpan lead.");
    }
  }

  const savedCount = Object.values(saved).filter((v) => v === "saved").length;

  const visible = useMemo(() => {
    let list = places.slice();
    if (filter === "hp") list = list.filter((p) => !!p.phone);
    if (filter === "rating") list = list.filter((p) => (p.rating ?? 0) >= 4.5);
    if (sort === "rating") list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === "ulasan") list.sort((a, b) => (b.user_ratings_total ?? 0) - (a.user_ratings_total ?? 0));
    return list;
  }, [places, filter, sort]);

  const filterChip = (key: Filter, label: string) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
        filter === key ? "border-[#1B5E3B] bg-[#1B5E3B] text-white" : "border-[#E7DCC8] bg-white text-stone-600 hover:border-[#1B5E3B] hover:text-[#1B5E3B]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="min-h-screen bg-[#FAF6EF]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-7">
          <p className="text-[11px] font-bold tracking-[0.25em] text-[#C9A227] uppercase">RestoLauncher · Alat Internal</p>
          <h1 className="font-display mt-1 text-3xl font-semibold text-zinc-900 sm:text-4xl">Cari Lead Restoran</h1>
          <p className="mt-1.5 max-w-lg text-sm text-zinc-500">
            Temukan restoran &amp; kafe calon pelanggan lewat Google Places, lalu simpan sebagai lead untuk dihubungi.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-4 lg:sticky lg:top-6">
            <LeadSidebar
              active={1}
              stats={[
                { label: "Hasil pencarian", value: searched ? places.length : "—" },
                { label: "Tersimpan dari hasil ini", value: savedCount },
                { label: "Total lead tersimpan", value: totalLeads ?? "—" },
              ]}
            />
          </aside>

          <div className="min-w-0">
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
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <p className="mr-1 text-sm font-medium text-zinc-600">
                  <strong className="text-zinc-900">{visible.length}</strong> dari {places.length} hasil untuk &quot;{searchedQuery}&quot;
                </p>
                <span className="mx-1 hidden h-4 w-px bg-zinc-300 sm:block" />
                {filterChip("semua", "Semua")}
                {filterChip("hp", "Ada nomor HP")}
                {filterChip("rating", "Rating 4,5+")}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="field ml-auto !w-auto !py-1.5 text-sm"
                  aria-label="Urutkan hasil"
                >
                  <option value="relevan">Paling relevan</option>
                  <option value="rating">Rating tertinggi</option>
                  <option value="ulasan">Ulasan terbanyak</option>
                </select>
              </div>
            )}

            {/* Jembatan ke langkah berikutnya */}
            {savedCount > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[#1B5E3B]/25 bg-[#1B5E3B]/[0.06] px-4 py-3">
                <p className="flex-1 text-sm text-zinc-700">
                  <FontAwesomeIcon icon={faCheck} className="mr-1.5 text-[#1B5E3B]" />
                  <strong>{savedCount} lead tersimpan</strong> dari pencarian ini. Langkah berikutnya: hubungi mereka lewat WhatsApp.
                </p>
                <Link href="/leads" className="rounded-xl bg-[#1B5E3B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#14492e]">
                  Ke Daftar Leads <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
                </Link>
              </div>
            )}

            {!loading && !searched && (
              <div className="rounded-3xl border-2 border-dashed border-[#1B5E3B]/25 px-6 py-12 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B5E3B]/10 text-xl text-[#1B5E3B]">
                  <FontAwesomeIcon icon={faUtensils} />
                </div>
                <p className="font-display text-lg font-semibold text-zinc-800">Mulai dari kata kunci</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
                  Ketik jenis usaha + kota, misalnya &quot;cafe bandung&quot; atau &quot;bakso jakarta&quot;, lalu tekan Cari.
                </p>
                <div className="mx-auto mt-7 grid max-w-2xl gap-2 text-left sm:grid-cols-4">
                  {LEAD_STEPS.map((s) => (
                    <div key={s.n} className="rounded-2xl border border-[#E7DCC8] bg-white/70 px-3 py-2.5">
                      <p className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F3ECDC] text-[11px] font-bold text-[#1B5E3B]">{s.n}</span>
                        {s.title}
                      </p>
                      <p className="mt-1 text-[11px] leading-snug text-zinc-500">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && searched && places.length > 0 && visible.length === 0 && (
              <p className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-4 py-6 text-center text-sm text-zinc-500">
                Tidak ada hasil yang cocok dengan saringan ini. Coba longgarkan saringannya.
              </p>
            )}

            <ul className="space-y-3">
              {visible.map((p) => {
                const state = saved[p.place_id];
                return (
                  <li key={p.place_id} className="panel flex flex-col gap-4 !rounded-3xl transition hover:shadow-md sm:flex-row sm:items-start">
                    {p.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`${p.photo_url}&w=240`} alt="" loading="lazy" className="h-36 w-full shrink-0 rounded-2xl object-cover sm:h-24 sm:w-24" />
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
                          {p.phone ?? <span className="text-zinc-400">tidak ada nomor</span>}
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
                      className={`w-full shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:w-auto ${
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
        </div>
      </div>
    </main>
  );
}
