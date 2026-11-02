"use client";

import { Suspense } from "react";

import { useParams } from "next/navigation";
import ProfilForm from "@/components/ProfilForm";
import OwnerGate from "../../OwnerGate";

// Halaman profil pemilik: gerbang PIN owner, isi formulirnya sama dengan yang
// dipakai dashboard admin (satu komponen ProfilForm, dua gerbang).
function OwnerProfilInner() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <OwnerGate slug={slug}>
      {(auth) => (
        <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
          <a href={`/owner/${slug}`} className="back-link">← Portal Pemilik</a>
          <h1 className="page-title mt-2">Profil Resto</h1>
          <p className="mt-1 text-sm text-zinc-500">Ubah tulisan & info yang tampil di website restomu.</p>
          <div className="panel mt-5">
            <ProfilForm restaurantId={auth.id} />
          </div>
        </main>
      )}
    </OwnerGate>
  );
}

export default function OwnerProfilPage() {
  return (
    <Suspense>
      <OwnerProfilInner />
    </Suspense>
  );
}
