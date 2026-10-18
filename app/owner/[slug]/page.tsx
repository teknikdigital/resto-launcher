"use client";

import { Suspense } from "react";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChair, faClipboardList, faPenToSquare, faGlobe, faMobileScreen } from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import OwnerGate from "../OwnerGate";

function OwnerDashboardInner() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  function logout() {
    sessionStorage.removeItem(`owner_${slug}`);
    router.push("/owner");
  }

  return (
    <OwnerGate slug={slug}>
      {(auth) => (
        <main className="mx-auto w-full max-w-2xl px-4 py-10">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="page-title">{auth.name}</h1>
              <p className="mt-0.5 text-sm text-zinc-500">Portal Owner — kelola restoramu</p>
            </div>
            <button onClick={logout} className="back-link">Keluar</button>
          </header>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href={`/owner/${slug}/tables`} className="panel hover:border-emerald-300">
              <p className="text-lg font-semibold"><FontAwesomeIcon icon={faChair} className="mr-2 text-[#1B5E3B]" />Meja & QR</p>
              <p className="mt-1 text-sm text-zinc-500">Tambah meja, unduh QR untuk dicetak & ditempel.</p>
            </Link>
            <Link href={`/owner/${slug}/menu`} className="panel hover:border-emerald-300">
              <p className="text-lg font-semibold"><FontAwesomeIcon icon={faClipboardList} className="mr-2 text-[#1B5E3B]" />Menu</p>
              <p className="mt-1 text-sm text-zinc-500">Tambah/edit menu & harga.</p>
            </Link>
            <Link href={`/owner/${slug}/profil`} className="panel hover:border-emerald-300">
              <p className="text-lg font-semibold"><FontAwesomeIcon icon={faPenToSquare} className="mr-2 text-[#1B5E3B]" />Profil Resto</p>
              <p className="mt-1 text-sm text-zinc-500">Edit nama, deskripsi, alamat, jam buka, foto.</p>
            </Link>
            <a href={`/r/${slug}`} target="_blank" rel="noreferrer" className="panel hover:border-emerald-300">
              <p className="text-lg font-semibold"><FontAwesomeIcon icon={faGlobe} className="mr-2 text-[#1B5E3B]" />Lihat Website</p>
              <p className="mt-1 font-mono text-sm text-zinc-500">/r/{slug} ↗</p>
            </a>
            <a href={`/r/${slug}/menu`} target="_blank" rel="noreferrer" className="panel hover:border-emerald-300">
              <p className="text-lg font-semibold"><FontAwesomeIcon icon={faMobileScreen} className="mr-2 text-[#1B5E3B]" />Menu Pelanggan</p>
              <p className="mt-1 text-sm text-zinc-500">Tampilan yang dibuka pelanggan via QR ↗</p>
            </a>
          </div>
          <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Butuh ubah QRIS, tema, atau info resto? Hubungi tim RestoLauncher via WhatsApp.
          </p>
        </main>
      )}
    </OwnerGate>
  );
}

export default function OwnerDashboard() {
  return (
    <Suspense>
      <OwnerDashboardInner />
    </Suspense>
  );
}
