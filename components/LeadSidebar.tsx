import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPaperPlane,
  faChartLine,
  faRocket,
  faBookmark,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// Alur kerja lead RestoLauncher — ditampilkan sebagai sidebar di /tools dan /leads
// supaya jalurnya selalu terlihat: cari -> hubungi -> pantau -> buatkan website.
export const LEAD_STEPS: { n: number; title: string; desc: string; href: string; icon: IconDefinition }[] = [
  { n: 1, title: "Cari & Simpan Lead", desc: "Temukan resto dari Google, simpan yang potensial.", href: "/tools", icon: faMagnifyingGlass },
  { n: 2, title: "Hubungi via WhatsApp", desc: "Kirim penawaran memakai template pesan.", href: "/leads", icon: faPaperPlane },
  { n: 3, title: "Pantau Status Lead", desc: "Dari baru, dihubungi, tertarik, sampai deal.", href: "/leads", icon: faChartLine },
  { n: 4, title: "Buatkan Website Resto", desc: "Satu klik dari lead — data resto terisi otomatis.", href: "/leads", icon: faRocket },
];

export default function LeadSidebar({
  active,
  stats,
}: {
  active: number;
  stats?: { label: string; value: string | number }[];
}) {
  return (
    <>
      {/* Strip langkah (HP): chip geser */}
      <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {LEAD_STEPS.map((s) => (
          <Link
            key={s.n}
            href={s.href}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold whitespace-nowrap ${
              s.n === active ? "border-[#1B5E3B] bg-[#1B5E3B] text-white" : "border-[#E7DCC8] bg-white text-stone-700"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                s.n === active ? "bg-white text-[#1B5E3B]" : "bg-[#F3ECDC] text-[#1B5E3B]"
              }`}
            >
              {s.n}
            </span>
            {s.title}
          </Link>
        ))}
      </nav>

      {/* Panel alur (desktop) */}
      <section className="panel hidden !py-4 lg:block">
        <p className="px-2 pb-3 text-[11px] font-bold tracking-[0.14em] text-stone-400 uppercase">Alur Lead</p>
        <ol>
          {LEAD_STEPS.map((s, i) => (
            <li key={s.n} className="relative">
              {i < LEAD_STEPS.length - 1 && (
                <span className="absolute top-11 left-[26px] h-[calc(100%-36px)] w-px bg-[#E7DCC8]" aria-hidden="true" />
              )}
              <Link
                href={s.href}
                className={`relative flex items-start gap-3 rounded-xl px-2 py-2.5 transition ${
                  s.n === active ? "bg-[#1B5E3B]/[0.07]" : "hover:bg-[#F6ECD2]/60"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
                    s.n === active ? "bg-[#1B5E3B] text-white" : "border border-[#E7DCC8] bg-white text-[#1B5E3B]"
                  }`}
                >
                  {s.n}
                </span>
                <span className="min-w-0 flex-1 pt-0.5">
                  <span className={`flex items-center gap-1.5 text-sm font-bold ${s.n === active ? "text-[#1B5E3B]" : "text-stone-800"}`}>
                    {s.title}
                    {s.n === active && <span className="shrink-0 rounded-full bg-[#1B5E3B] px-2 py-px text-[10px] font-bold whitespace-nowrap text-white">Di sini</span>}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-stone-500">{s.desc}</span>
                </span>
                <FontAwesomeIcon icon={s.icon} className={`mt-1.5 text-sm ${s.n === active ? "text-[#1B5E3B]" : "text-stone-300"}`} />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Ringkasan */}
      {stats && stats.length > 0 && (
        <section className="panel hidden !py-4 lg:block">
          <p className="px-2 pb-2 text-[11px] font-bold tracking-[0.14em] text-stone-400 uppercase">Ringkasan</p>
          <dl className="space-y-2 px-2">
            {stats.map((s) => (
              <div key={s.label} className="flex items-baseline justify-between border-b border-dashed border-stone-200 pb-1.5 last:border-0 last:pb-0">
                <dt className="text-sm text-stone-500">{s.label}</dt>
                <dd className="font-display text-lg font-bold text-stone-900">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Tautan cepat */}
      <section className="panel hidden !py-3 lg:block">
        <Link href="/leads" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-[#F6ECD2]/70">
          <FontAwesomeIcon icon={faBookmark} className="w-4 text-center text-[#1B5E3B]" /> Daftar Leads
        </Link>
        <Link href="/admin/restaurants" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-[#F6ECD2]/70">
          <FontAwesomeIcon icon={faStore} className="w-4 text-center text-[#1B5E3B]" /> Admin Resto
        </Link>
      </section>
    </>
  );
}
