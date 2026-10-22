"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faPaperPlane, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/lead-types";
import LeadSidebar from "@/components/LeadSidebar";

const TEMPLATE_KEY = "wa_template";
const DEFAULT_TEMPLATE =
  "Halo {nama}, kami menawarkan jasa pembuatan landing page dan aplikasi pemesanan makanan untuk usaha Anda di {alamat}. Boleh kami info lebih lanjut?";

function toWaNumber(phone: string | null): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  return digits;
}

function buildWaUrl(lead: Lead, template: string): string | null {
  const number = toWaNumber(lead.phone);
  if (!number) return null;
  const text = template.replaceAll("{nama}", lead.name).replaceAll("{alamat}", lead.address ?? "");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

type StatusFilter = LeadStatus | "semua";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");

  useEffect(() => {
    const stored = localStorage.getItem(TEMPLATE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setTemplate(stored);
    fetch("/api/leads")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Gagal memuat leads");
        setLeads(data.leads);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat leads"))
      .finally(() => setLoading(false));
  }, []);

  function changeTemplate(value: string) {
    setTemplate(value);
    localStorage.setItem(TEMPLATE_KEY, value);
  }

  async function patch(id: string, body: { status?: LeadStatus; notes?: string }) {
    setError("");
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError("Gagal menyimpan perubahan.");
      return;
    }
    const { lead } = await res.json();
    setLeads((ls) => ls.map((l) => (l.id === id ? lead : l)));
  }

  const countByStatus = useMemo(() => {
    const map = new Map<LeadStatus, number>();
    for (const l of leads) map.set(l.status, (map.get(l.status) ?? 0) + 1);
    return map;
  }, [leads]);

  const shown = statusFilter === "semua" ? leads : leads.filter((l) => l.status === statusFilter);

  const chip = (key: StatusFilter, label: string, n: number) => (
    <button
      key={key}
      onClick={() => setStatusFilter(key)}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
        statusFilter === key
          ? "border-[#1B5E3B] bg-[#1B5E3B] text-white"
          : "border-[#E7DCC8] bg-white text-stone-600 hover:border-[#1B5E3B] hover:text-[#1B5E3B]"
      }`}
    >
      {label} · {n}
    </button>
  );

  return (
    <main className="min-h-screen bg-[#FAF6EF]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-7">
          <p className="text-[11px] font-bold tracking-[0.25em] text-[#C9A227] uppercase">RestoLauncher · Alat Internal</p>
          <h1 className="font-display mt-1 text-3xl font-semibold text-zinc-900 sm:text-4xl">Daftar Leads</h1>
          <p className="mt-1.5 max-w-lg text-sm text-zinc-500">
            Calon pelanggan dari alat pencari. Hubungi via WA, pantau statusnya, lalu buatkan websitenya.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-4 lg:sticky lg:top-6">
            <LeadSidebar
              active={2}
              stats={[
                { label: "Total lead", value: leads.length },
                ...LEAD_STATUSES.filter((s) => (countByStatus.get(s) ?? 0) > 0).map((s) => ({
                  label: `Status ${s}`,
                  value: countByStatus.get(s) ?? 0,
                })),
              ]}
            />
          </aside>

          <div className="min-w-0">
            <section className="panel mb-6 !rounded-3xl">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <label htmlFor="tpl" className="text-sm font-semibold text-zinc-800">
                  Template pesan WA
                </label>
                <span className="rounded-full bg-[#F3ECDC] px-2.5 py-0.5 text-[11px] font-bold text-[#1B5E3B]">
                  Langkah 2 · dipakai tombol WA di tiap lead
                </span>
              </div>
              <textarea id="tpl" rows={3} value={template} onChange={(e) => changeTemplate(e.target.value)} className="field" />
              <p className="mt-1.5 text-xs text-zinc-500">
                Variabel: {"{nama}"}, {"{alamat}"}. Tersimpan otomatis di browser ini. Setelah mengirim pesan, ubah status lead-nya
                jadi <strong>dihubungi</strong> supaya alurnya terpantau.
              </p>
            </section>

            {error && <p className="alert-error mb-4">{error}</p>}

            {loading ? (
              <div className="space-y-3" aria-busy="true" aria-label="Memuat">
                <div className="skeleton h-12 w-full" />
                <div className="skeleton h-16 w-full" />
                <div className="skeleton h-16 w-full" />
              </div>
            ) : leads.length === 0 ? (
              <div className="empty-state !rounded-3xl">
                <div className="empty-state-icon text-[#1B5E3B]">
                  <FontAwesomeIcon icon={faWandMagicSparkles} />
                </div>
                <p className="font-semibold text-zinc-800">Belum ada lead</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Cari restoran lewat <Link href="/tools" className="font-medium text-[#1B5E3B] underline">Alat Cari Lead</Link> lalu simpan sebagai lead.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <p className="mr-1 text-sm font-medium text-zinc-600">
                    Menampilkan <strong className="text-zinc-900">{shown.length}</strong> lead
                  </p>
                  {chip("semua", "Semua", leads.length)}
                  {LEAD_STATUSES.map((s) => chip(s, s[0].toUpperCase() + s.slice(1), countByStatus.get(s) ?? 0))}
                </div>

                {shown.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-4 py-6 text-center text-sm text-zinc-500">
                    Belum ada lead berstatus &quot;{statusFilter}&quot;. Pilih status lain atau Semua.
                  </p>
                ) : (
                  <div className="table-wrap !rounded-3xl">
                    <table className="data-table min-w-[880px]">
                      <thead>
                        <tr>
                          <th>Nama</th>
                          <th>Alamat</th>
                          <th>Telepon</th>
                          <th>Rating</th>
                          <th>Status</th>
                          <th>Catatan</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {shown.map((lead) => {
                          const wa = buildWaUrl(lead, template);
                          return (
                            <tr key={lead.id} className="align-top">
                              <td className="font-semibold text-zinc-900">{lead.name}</td>
                              <td className="max-w-56 text-zinc-600">{lead.address ?? "-"}</td>
                              <td className="whitespace-nowrap">{lead.phone ?? "-"}</td>
                              <td className="whitespace-nowrap">
                                {lead.rating ? (
                                  <span className="inline-flex items-center gap-1">
                                    <FontAwesomeIcon icon={faStar} className="text-[#C9A227]" /> {lead.rating}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td>
                                <select
                                  value={lead.status}
                                  onChange={(e) => patch(lead.id, { status: e.target.value as LeadStatus })}
                                  className="field !w-auto !py-1.5"
                                >
                                  {LEAD_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  key={lead.updated_at}
                                  defaultValue={lead.notes ?? ""}
                                  onBlur={(e) => {
                                    if (e.target.value !== (lead.notes ?? "")) patch(lead.id, { notes: e.target.value });
                                  }}
                                  placeholder="Catatan…"
                                  className="field !w-48 !py-1.5"
                                />
                              </td>
                              <td className="whitespace-nowrap">
                                <div className="flex gap-2">
                                  <button
                                    disabled={!wa}
                                    onClick={() => wa && window.open(wa, "_blank", "noopener,noreferrer")}
                                    className="rounded-lg bg-[#1B5E3B] px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-[#14492e] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500"
                                  >
                                    <FontAwesomeIcon icon={faPaperPlane} className="mr-1.5" /> WA
                                  </button>
                                  <Link
                                    href={`/admin/restaurants?${new URLSearchParams({
                                      name: lead.name,
                                      address: lead.address ?? "",
                                      phone: lead.phone ?? "",
                                      maps_url: lead.maps_url ?? "",
                                      cover_url: `/api/places/photo?place_id=${encodeURIComponent(lead.place_id)}`,
                                    }).toString()}`}
                                    className="btn-secondary btn-sm"
                                  >
                                    Buatkan dari Lead
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="mt-3 text-xs text-zinc-500">
                  Langkah terakhir (langkah 4): tombol <strong>Buatkan dari Lead</strong> membuka form resto dengan nama, alamat, dan
                  telepon yang sudah terisi dari lead ini.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
