"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/lead-types";

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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);

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

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <nav className="flex gap-4 text-sm font-medium text-blue-600">
          <Link href="/admin/restaurants" className="hover:underline">
            Restoran
          </Link>
          <Link href="/" className="hover:underline">
            Cari Lead
          </Link>
        </nav>
      </header>

      <section className="mb-6">
        <label htmlFor="tpl" className="mb-1 block text-sm font-medium">
          Template pesan WA
        </label>
        <textarea
          id="tpl"
          rows={3}
          value={template}
          onChange={(e) => changeTemplate(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Variabel: {"{nama}"}, {"{alamat}"}. Tersimpan di browser ini.
        </p>
      </section>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-zinc-500">Memuat...</p>
      ) : leads.length === 0 ? (
        <p className="text-sm text-zinc-500">Belum ada lead.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-xs uppercase text-zinc-600">
              <tr>
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2">Alamat</th>
                <th className="px-3 py-2">Telepon</th>
                <th className="px-3 py-2">Rating</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Notes</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {leads.map((lead) => {
                const wa = buildWaUrl(lead, template);
                return (
                  <tr key={lead.id} className="align-top">
                    <td className="px-3 py-2 font-medium">{lead.name}</td>
                    <td className="px-3 py-2 text-zinc-600">{lead.address ?? "-"}</td>
                    <td className="whitespace-nowrap px-3 py-2">{lead.phone ?? "-"}</td>
                    <td className="px-3 py-2">{lead.rating ?? "-"}</td>
                    <td className="px-3 py-2">
                      <select
                        value={lead.status}
                        onChange={(e) => patch(lead.id, { status: e.target.value as LeadStatus })}
                        className="rounded-md border border-zinc-300 bg-transparent px-2 py-1"
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        key={lead.updated_at}
                        defaultValue={lead.notes ?? ""}
                        onBlur={(e) => {
                          if (e.target.value !== (lead.notes ?? "")) patch(lead.id, { notes: e.target.value });
                        }}
                        placeholder="Catatan..."
                        className="w-48 rounded-md border border-zinc-300 bg-transparent px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                      <Link
                        href={`/admin/restaurants?${new URLSearchParams({
                          name: lead.name,
                          address: lead.address ?? "",
                          phone: lead.phone ?? "",
                          maps_url: lead.maps_url ?? "",
                          cover_url: `/api/places/photo?place_id=${encodeURIComponent(lead.place_id)}`,
                        }).toString()}`}
                        className="whitespace-nowrap rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-100"
                      >
                        Buatkan dari Lead
                      </Link>
                      <button
                        disabled={!wa}
                        onClick={() => wa && window.open(wa, "_blank", "noopener,noreferrer")}
                        className="whitespace-nowrap rounded-md bg-green-600 px-3 py-1 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500"
                      >
                        Kirim WA
                      </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
