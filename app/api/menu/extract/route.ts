import { NextResponse } from "next/server";
import { adminSesiValid } from "@/lib/keamanan";

export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png"];

const PROMPT =
  'Ekstrak semua item menu dari dokumen/gambar menu restoran ini. Balas HANYA dengan JSON objek berbentuk {"items":[{"category":string,"name":string,"description":string,"price":number}]}. ' +
  'price harus angka bulat tanpa "Rp", titik, atau koma (contoh "Rp 25.000" atau "25k" menjadi 25000). ' +
  'Bila kategori atau deskripsi tidak ada, isi string kosong. Jangan mengarang item yang tidak terlihat.';

type Extracted = { category: string; name: string; description: string; price: number };

function normalize(raw: unknown): Extracted[] {
  const list = Array.isArray(raw) ? raw : (raw as { items?: unknown })?.items;
  if (!Array.isArray(list)) return [];
  const out: Extracted[] = [];
  for (const r of list) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    if (!name) continue;
    const price = typeof o.price === "number" ? o.price : Number(String(o.price ?? "").replace(/[^\d]/g, ""));
    out.push({
      category: typeof o.category === "string" ? o.category.trim() : "",
      name,
      description: typeof o.description === "string" ? o.description.trim() : "",
      price: Number.isFinite(price) && price >= 0 ? Math.round(price) : 0,
    });
  }
  return out;
}

export async function POST(request: Request) {
  // Keamanan (25 Okt 2026): endpoint berbayar hanya untuk operator
  // yang sudah lewat gerbang PIN admin (cookie sesi). Tanpa ini siapa
  // pun bisa membakar biaya OpenAI dari luar.
  if (!(await adminSesiValid(request))) {
    return NextResponse.json({ error: "Hanya operator yang boleh memakai fitur ini" }, { status: 401 });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY belum dikonfigurasi" }, { status: 500 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Ukuran file maksimal 10 MB" }, { status: 400 });

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf && !IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Format harus JPG, PNG, atau PDF" }, { status: 400 });
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  // Tidak ada pustaka render PDF terpasang; PDF dikirim langsung sebagai file input (model membaca halaman sebagai gambar).
  const filePart = isPdf
    ? { type: "file", file: { filename: file.name || "menu.pdf", file_data: `data:application/pdf;base64,${base64}` } }
    : { type: "image_url", image_url: { url: `data:${file.type};base64,${base64}` } };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0,
        messages: [{ role: "user", content: [{ type: "text", text: PROMPT }, filePart] }],
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = data?.error?.message ?? `HTTP ${res.status}`;
      console.error("OpenAI error:", res.status, msg);
      return NextResponse.json(
        { error: isPdf ? `Gagal memproses PDF: ${msg}. Coba unggah sebagai foto.` : `Gagal memproses gambar: ${msg}` },
        { status: 502 },
      );
    }
    const content = data?.choices?.[0]?.message?.content;
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "Respons AI tidak valid, coba lagi" }, { status: 502 });
    }
    const items = normalize(parsed);
    if (items.length === 0) return NextResponse.json({ error: "Tidak ada item menu yang terdeteksi" }, { status: 422 });
    return NextResponse.json({ items });
  } catch (err) {
    console.error("Extract error:", err);
    return NextResponse.json({ error: "Gagal menghubungi layanan AI" }, { status: 502 });
  }
}
