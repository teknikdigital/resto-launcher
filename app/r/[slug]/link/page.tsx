"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { initials, instagramUrl, tiktokUrl, toWaNumber, type Restaurant } from "@/lib/resto-types";
import { readableOn } from "@/lib/resto-themes";
import { PageStatus } from "../RestaurantView";
import { AlertIcon, InstagramIcon, LockIcon, PinIcon, TiktokIcon, UtensilsIcon, WhatsappIcon } from "../icons";

type Data = { restaurant: Restaurant; active: boolean };

// Link-in-bio untuk Instagram: satu kolom, tombol besar.
export default function LinkInBioPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/restaurants/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const d = await res.json();
        if (!res.ok) throw new Error(d.error ?? "Gagal memuat restoran");
        setData(d);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat restoran"));
  }, [slug]);

  if (error)
    return (
      <PageStatus>
        <div className="empty-state-icon">
          <AlertIcon className="h-7 w-7 text-zinc-500" />
        </div>
        <p className="font-semibold text-zinc-800">Halaman tidak bisa dimuat</p>
        <p className="mt-1 text-sm text-zinc-500">{error}</p>
      </PageStatus>
    );
  if (!data) return <PageStatus loading />;

  const { restaurant: r, active } = data;
  if (!active) {
    return (
      <PageStatus>
        <div className="empty-state-icon">
          <LockIcon className="h-7 w-7 text-zinc-500" />
        </div>
        <h1 className="mb-1 text-xl font-semibold text-zinc-900">{r.name}</h1>
        <p className="text-zinc-600">Halaman ini sudah tidak aktif</p>
      </PageStatus>
    );
  }

  const color = r.primary_color ?? "#16a34a";
  const wa = toWaNumber(r.whatsapp);
  const links: { label: string; icon: React.ReactNode; href: string; internal?: boolean; primary?: boolean }[] = [
    { label: "Lihat Menu", icon: <UtensilsIcon />, href: `/r/${r.slug}/menu`, internal: true, primary: true },
  ];
  if (wa) {
    links.push({
      label: "Pesan via WhatsApp",
      icon: <WhatsappIcon />,
      href: `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin memesan.`)}`,
    });
  }
  if (r.maps_url) links.push({ label: "Lokasi (Google Maps)", icon: <PinIcon />, href: r.maps_url });
  const ig = instagramUrl(r.instagram);
  if (ig) links.push({ label: "Instagram", icon: <InstagramIcon />, href: ig });
  const tt = tiktokUrl(r.tiktok);
  if (tt) links.push({ label: "TikTok", icon: <TiktokIcon />, href: tt });

  const btn =
    "flex w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-center text-base font-semibold shadow-sm transition duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]";

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${color}1f 0%, #fafafa 38%)` }}>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-5 py-12 text-center sm:py-16">
        {r.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.logo_url} alt={`Logo ${r.name}`} className="h-28 w-28 shrink-0 rounded-full border border-zinc-200 bg-white object-contain p-2 shadow-md ring-4 ring-white" />
        ) : (
          <div
            className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-4xl font-bold shadow-md ring-4 ring-white"
            style={{ backgroundColor: color, color: readableOn(color) }}
          >
            {initials(r.name)}
          </div>
        )}
        <h1 className="mt-6 max-w-full break-words text-2xl font-bold tracking-tight text-zinc-900">{r.name}</h1>
        {r.description && <p className="mt-2 line-clamp-3 max-w-sm text-sm leading-relaxed text-zinc-600">{r.description}</p>}

        <nav className="mt-9 w-full space-y-3.5">
          {links.map((l) => {
            const props = l.primary
              ? { className: btn, style: { backgroundColor: color, color: readableOn(color) } }
              : { className: `${btn} border border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50` };
            return l.internal ? (
              <a key={l.label} href={l.href} {...props}>
                {l.icon}
                {l.label}
              </a>
            ) : (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" {...props}>
                {l.icon}
                {l.label}
              </a>
            );
          })}
        </nav>

        <p className="mt-auto pt-12 text-xs text-zinc-500">{r.name}</p>
      </main>
    </div>
  );
}
