// Util QRIS: parsing & pembuatan payload dinamis (standar EMVCo TLV).
// Dipakai untuk mengubah QRIS statis milik restoran menjadi QRIS dinamis
// dengan nominal terkunci per pesanan. Uang tetap langsung ke restoran;
// fungsi ini hanya memformat ulang payload, tidak menyentuh dana.

export type TlvField = { id: string; value: string };

/** Pecah payload EMVCo menjadi field-field TLV (id 2 digit + panjang 2 digit). */
export function parseTlv(payload: string): TlvField[] {
  const fields: TlvField[] = [];
  const s = payload.trim();
  let i = 0;
  while (i + 4 <= s.length) {
    const id = s.slice(i, i + 2);
    const len = parseInt(s.slice(i + 2, i + 4), 10);
    if (!/^\d{2}$/.test(id) || Number.isNaN(len) || len < 0) break;
    const value = s.slice(i + 4, i + 4 + len);
    if (value.length < len) break;
    fields.push({ id, value });
    i += 4 + len;
  }
  return fields;
}

function buildTlv(id: string, value: string): string {
  return id + String(value.length).padStart(2, "0") + value;
}

/** CRC16-CCITT (poly 0x1021, init 0xFFFF) — checksum field 63 QRIS. */
export function crc16Ccitt(s: string): string {
  let crc = 0xffff;
  for (let i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Cek cepat apakah string terlihat seperti payload QRIS. */
export function isQrisPayload(s: string): boolean {
  const t = (s ?? "").trim();
  return t.startsWith("000201") && /ID\.CO\.QRIS\.WWW/i.test(t);
}

/** Ambil nilai field EMVCo berdasarkan id (mis. "59" = nama merchant). */
export function qrisField(payload: string, id: string): string | null {
  const f = parseTlv(payload).find((x) => x.id === id);
  return f ? f.value : null;
}

export function qrisMerchantName(payload: string): string | null {
  return qrisField(payload, "59");
}

export function qrisMerchantCity(payload: string): string | null {
  return qrisField(payload, "60");
}

/**
 * Ubah QRIS statis menjadi dinamis dengan nominal rupiah (bilangan bulat).
 * Field merchant disalin apa adanya; hanya field 01 (jadi "12"),
 * field 54 (nominal), dan field 63 (CRC) yang ditulis ulang.
 */
export function makeDynamicQris(staticPayload: string, amountIdr: number): string {
  const amount = Math.round(amountIdr);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Nominal tidak valid");
  const fields = parseTlv(staticPayload)
    .filter((f) => f.id !== "54" && f.id !== "63")
    .map((f) => (f.id === "01" ? { id: "01", value: "12" } : f));
  fields.push({ id: "54", value: String(amount) });
  fields.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const body = fields.map((f) => buildTlv(f.id, f.value)).join("") + "6304";
  return body + crc16Ccitt(body);
}
