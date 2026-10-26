"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ThemePreview from "@/components/ThemePreview";
import { toTemplate, TEMPLATE_LABELS, type Restaurant, type RestaurantTemplate } from "@/lib/resto-types";
import OwnerGate from "../../OwnerGate";

// Halaman tema: pemilik bisa mempratinjau semua tema dengan data restonya sendiri.
// Mengganti tema tetap dibantu tim RestoLauncher (tombol minta via WhatsApp).
export default function OwnerTemaPage() {
  return (
    <Suspense>
      <OwnerTemaInner />
    </Suspense>
  );
}

function OwnerTemaInner() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <OwnerGate slug={slug}>
      {(auth) => <TemaInner restaurantId={auth.id} slug={slug} />}
    </OwnerGate>
  );
}

function TemaInner({ restaurantId, slug }: { restaurantId: string; slug: string }) {
  const [resto, setResto] = useState<Restaurant | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/restaurants");
        const d = await res.json();
        setResto((d.restaurants as Restaurant[]).find((x) => x.id === restaurantId) ?? null);
      } catch {
        setResto(null);
      }
    })();
  }, [restaurantId]);

  const ownerWa = process.env.NEXT_PUBLIC_OWNER_WA ?? "";
  const requestHrefFor = (t: RestaurantTemplate): string | null => {
    if (!ownerWa || !resto) return null;
    const text = `Halo tim RestoLauncher, saya pemilik ${resto.name}. Saya mau ganti tema website ke ${TEMPLATE_LABELS[t]}. Terima kasih.`;
    return `https://wa.me/${ownerWa}?text=${encodeURIComponent(text)}`;
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
      <Link href={`/owner/${slug}`} className="back-link">
        ← Portal Pemilik
      </Link>
      <h1 className="page-title mt-3">Tema &amp; Tampilan</h1>
      <p className="mb-6 mt-1 max-w-2xl text-sm text-stone-500">
        Coba lihat tampilan websitemu dengan tema lain — pratinjau ini memakai foto, menu, dan data restoranmu
        yang sebenarnya. Kalau sudah menemukan yang cocok, minta ganti ke tim kami lewat tombol WhatsApp di bawah
        pratinjau. Pergantian tema dibantu tanpa biaya tambahan.
      </p>
      {resto ? (
        <div className="panel">
          <ThemePreview slug={slug} current={toTemplate(resto.template)} requestHrefFor={requestHrefFor} />
        </div>
      ) : (
        <p className="text-sm text-stone-500">Memuat data restoran…</p>
      )}
    </main>
  );
}
