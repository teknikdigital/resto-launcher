import { NextResponse } from "next/server";

export const maxDuration = 30;

// POST { name, address?, category? } -> { description } (2-3 kalimat promosi, Bahasa Indonesia).
export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY belum diset di server. Tambahkan di .env lalu restart." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const field = (k: string) => (typeof body?.[k] === "string" ? body[k].trim().slice(0, 200) : "");
  const name = field("name");
  const address = field("address");
  const category = field("category");
  if (!name) return NextResponse.json({ error: "Isi nama restoran dulu" }, { status: 400 });

  const prompt =
    `Tulis deskripsi promosi 2-3 kalimat dalam Bahasa Indonesia yang hangat dan menjual untuk restoran/kafe berikut.\n` +
    `Nama: ${name}\n` +
    (category ? `Kategori: ${category}\n` : "") +
    (address ? `Alamat: ${address}\n` : "") +
    `Jangan mengarang fakta spesifik (harga, penghargaan, menu tertentu). Tanpa emoji, tanpa tanda kutip, tanpa judul; balas hanya paragrafnya.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.8,
        max_tokens: 250,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = data?.error?.message ?? `HTTP ${res.status}`;
      console.error("OpenAI error:", res.status, msg);
      return NextResponse.json({ error: `Gagal membuat deskripsi: ${msg}` }, { status: 502 });
    }
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Respons AI kosong, coba lagi" }, { status: 502 });
    }
    return NextResponse.json({ description: text.trim().replace(/^["']|["']$/g, "") });
  } catch (err) {
    console.error("OpenAI error:", err);
    return NextResponse.json({ error: "Tidak bisa menghubungi OpenAI" }, { status: 502 });
  }
}
