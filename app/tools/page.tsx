"use client";

import Link from "next/link";
import { useState } from "react";

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

export default function Home() {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Record<string, "saving" | "saved">>({});

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Terjadi kesalahan");
      setPlaces(data.places);
      setSaved({});
      if (data.places.length === 0) setError("Tidak ada hasil.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
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
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Alat Cari Lead</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Halaman internal — cari restoran & kafe via Google Places.</p>
        </div>
        <Link href="/leads" className="text-sm font-medium text-blue-600 hover:underline">
          Lihat Leads
        </Link>
      </header>

      <form onSubmit={search} className="mb-6 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Contoh: "cafe bandung"'
          className="flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Mencari..." : "Cari"}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <ul className="space-y-3">
        {places.map((p) => (
          <li key={p.place_id} className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 p-4">
            {p.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${p.photo_url}&w=240`} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
            )}
            <div className="min-w-0 flex-1 text-sm">
              <h2 className="text-base font-medium">{p.name}</h2>
              <p className="text-zinc-600">{p.address ?? "-"}</p>
              <p className="mt-1 text-zinc-600">
                Rating: {p.rating ?? "-"}
                {p.user_ratings_total ? ` (${p.user_ratings_total} ulasan)` : ""} · Telepon: {p.phone ?? "-"}
              </p>
            </div>
            <button
              onClick={() => save(p)}
              disabled={!!saved[p.place_id]}
              className="shrink-0 rounded-md border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-default disabled:border-zinc-300 disabled:text-zinc-500 disabled:hover:bg-transparent"
            >
              {saved[p.place_id] === "saved"
                ? "Tersimpan"
                : saved[p.place_id] === "saving"
                  ? "Menyimpan..."
                  : "Simpan sebagai Lead"}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
