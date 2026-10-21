"use client";

import { useState } from "react";
import {
  TEMPLATES,
  TEMPLATE_LABELS,
  TEMPLATE_DESCRIPTIONS,
  type RestaurantTemplate,
} from "@/lib/resto-types";

// Pratinjau tema langsung: iframe ke halaman publik restoran dengan ?tema=<template>.
// Pilihan tema hanya mengubah tampilan pratinjau — tidak menyimpan apa pun sampai
// tombol "Pakai tema ini" ditekan (mode admin) atau diminta via WA (mode pemilik).
export default function ThemePreview({
  slug,
  current,
  canApply = false,
  onApply,
  requestHrefFor,
}: {
  slug: string;
  current: RestaurantTemplate;
  canApply?: boolean;
  onApply?: (t: RestaurantTemplate) => Promise<void> | void;
  requestHrefFor?: (t: RestaurantTemplate) => string | null;
}) {
  const [selected, setSelected] = useState<RestaurantTemplate>(current);
  const [view, setView] = useState<"website" | "menu">("website");
  const [device, setDevice] = useState<"hp" | "laptop">("hp");
  const [applying, setApplying] = useState(false);
  const [note, setNote] = useState("");

  const src = view === "website" ? `/r/${slug}?tema=${selected}` : `/r/${slug}/menu?tema=${selected}`;
  const changed = selected !== current;
  const requestHref = requestHrefFor ? requestHrefFor(selected) : null;

  async function apply() {
    if (!onApply) return;
    setApplying(true);
    setNote("");
    try {
      await onApply(selected);
      setNote(`Tema ${TEMPLATE_LABELS[selected]} sudah aktif.`);
    } catch {
      setNote("Gagal menyimpan tema. Coba lagi.");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div>
      {/* Pilihan tema */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TEMPLATES.map((t) => {
          const on = selected === t;
          return (
            <button
              key={t}
              onClick={() => {
                setSelected(t);
                setNote("");
              }}
              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                on
                  ? "border-[#1B5E3B] bg-[#1B5E3B] text-white shadow-sm"
                  : "border-[#E7DCC8] bg-white text-stone-700 hover:border-[#1B5E3B]/50"
              }`}
              title={TEMPLATE_DESCRIPTIONS[t]}
            >
              {TEMPLATE_LABELS[t]}
              {t === current && (
                <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${on ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-700"}`}>
                  Aktif
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mb-4 text-sm text-stone-500">
        <strong className="text-stone-700">{TEMPLATE_LABELS[selected]}</strong> — {TEMPLATE_DESCRIPTIONS[selected]}. Pratinjau memakai data restoranmu yang sebenarnya.
      </p>

      {/* Pengalih tampilan & perangkat */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-[#E7DCC8] bg-white p-1">
          {(
            [
              ["website", "Website"],
              ["menu", "Menu Pelanggan"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${view === v ? "bg-[#1B5E3B] text-white" : "text-stone-600 hover:bg-stone-100"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex rounded-full border border-[#E7DCC8] bg-white p-1">
          {(
            [
              ["hp", "HP"],
              ["laptop", "Laptop"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setDevice(v)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${device === v ? "bg-[#1B5E3B] text-white" : "text-stone-600 hover:bg-stone-100"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <a href={src} target="_blank" rel="noreferrer" className="ml-auto text-xs font-medium text-[#1B5E3B] underline-offset-2 hover:underline">
          Buka pratinjau di tab baru ↗
        </a>
      </div>

      {/* Bingkai pratinjau */}
      <div className="rounded-[2rem] border-2 border-dashed border-[#D9C48F] bg-[#F6ECD2]/50 px-3 py-5 sm:px-6">
        {device === "hp" ? (
          <div className="mx-auto w-full max-w-[380px] overflow-hidden rounded-[2.2rem] border-[10px] border-stone-900 bg-white shadow-2xl">
            <iframe key={src} src={src} title={`Pratinjau tema ${TEMPLATE_LABELS[selected]}`} className="block h-[620px] w-full border-0" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E7DCC8] bg-white shadow-xl">
            <div className="flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-2 truncate font-mono text-[11px] text-stone-500">{src.replace("?tema=", " · tema ")}</span>
            </div>
            <iframe key={src} src={src} title={`Pratinjau tema ${TEMPLATE_LABELS[selected]}`} className="block h-[560px] w-full border-0" />
          </div>
        )}
      </div>

      {/* Aksi */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {canApply ? (
          <button onClick={apply} disabled={!changed || applying} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
            {applying ? "Menyimpan..." : changed ? `Pakai Tema ${TEMPLATE_LABELS[selected]}` : "Tema ini sedang aktif"}
          </button>
        ) : requestHref ? (
          <a
            href={requestHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn-primary ${!changed ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={!changed}
          >
            Minta Ganti ke Tema {TEMPLATE_LABELS[selected]} via WhatsApp
          </a>
        ) : (
          <p className="text-sm text-stone-500">Untuk mengganti tema, hubungi tim RestoLauncher — pergantian dibantu tanpa biaya tambahan.</p>
        )}
        {note && <p className="text-sm font-medium text-emerald-700">{note}</p>}
        {changed && <p className="text-xs text-stone-400">Pratinjau belum mengubah tema aktif restoranmu.</p>}
      </div>
    </div>
  );
}
