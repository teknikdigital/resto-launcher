// Keamanan RestoLauncher — satu tempat untuk semua penjaga.
// Dibuat 25 Okt 2026 dari laporan keamanan Elaina (QA):
//  - PIN tidak lagi disimpan sebagai teks biasa: format "v1$<salt>$<hash>"
//    (SHA-256 dari salt + PIN). Baris lama yang masih teks biasa tetap
//    bisa masuk lewat jalur lama, lalu otomatis ditingkatkan ke format
//    hash pada login berhasil berikutnya (tidak perlu migrasi SQL).
//  - Verifikasi PIN dibatasi: 5 kali salah -> kunci 15 menit per
//    restoran/IP. Penghitung hanya di memori server (bukan database),
//    jadi di Vercel tiap instans menghitung sendiri — cukup untuk
//    memperlambat tebakan, bukan benteng absolut.
//  - Sesi admin: cookie httpOnly bertanda HMAC dari ADMIN_PIN, dipakai
//    endpoint berbayar (ekstrak AI, deskripsi AI). Halaman operator
//    tetap memakai gerbang PIN-nya sendiri (AdminGate).
//  - Cap spam: pesanan publik dibatasi 30/menit per resto, foto Places
//    dibatasi 60/menit per IP — cukup menahan banjir, tidak mengganggu
//    pengunjung normal (satu resto jarang melewati angka itu).

const AWALAN_HASH = "v1$";
const MAKS_GAGAL = 5;
const KUNCI_MS = 15 * 60 * 1000;
const NAMA_COOKIE_ADMIN = "resto-admin-sesi";

function keHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function utf8(teks: string): ArrayBuffer {
  // Diiris tepat sepanjang hasil encode supaya tipenya ArrayBuffer
  // murni (diterima crypto.subtle di semua runtime).
  const b = new TextEncoder().encode(teks);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
}

/** Salt acak 16 byte dalam bentuk hex (32 karakter). */
export function buatSalt(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/** SHA-256 dari (salt + PIN), hasil hex. */
export async function hashPin(salt: string, pin: string): Promise<string> {
  return keHex(await crypto.subtle.digest("SHA-256", utf8(salt + pin)));
}

/** "v1$<salt>$<hash>" untuk PIN baru. */
export async function simpanPin(pin: string, salt?: string): Promise<string> {
  const s = salt ?? buatSalt();
  return `${AWALAN_HASH}${s}$${await hashPin(s, pin)}`;
}

/** Apakah nilai tersimpan sudah berformat hash (bukan teks biasa). */
export function pinSudahHash(nilai: string | null | undefined): boolean {
  return typeof nilai === "string" && nilai.startsWith(AWALAN_HASH);
}

/**
 * Cocokkan PIN kiriman dengan nilai tersimpan.
 * Mengembalikan "cocok" | "tidak" | "cocok-lama" (teks biasa: pemanggil
 * sebaiknya meningkatkan ke format hash sesudah login berhasil).
 */
export async function cocokPin(
  pin: string,
  tersimpan: string | null | undefined,
): Promise<"cocok" | "tidak" | "cocok-lama"> {
  if (!tersimpan) return "tidak";
  if (tersimpan.startsWith(AWALAN_HASH)) {
    const [, salt, hash] = tersimpan.split("$");
    if (!salt || !hash) return "tidak";
    const hitung = await hashPin(salt, pin);
    if (hitung.length !== hash.length) return "tidak";
    let beda = 0;
    for (let i = 0; i < hitung.length; i++) beda |= hitung.charCodeAt(i) ^ hash.charCodeAt(i);
    return beda === 0 ? "cocok" : "tidak";
  }
  return tersimpan === pin ? "cocok-lama" : "tidak";
}

export function ipDari(request: Request): string {
  const maju = request.headers.get("x-forwarded-for");
  if (maju) return maju.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "tak-dikenal";
}

// ---------- Batas percobaan (rate limit) ----------

type CatatanCoba = { gagal: number; kunciSampai: number };
const percobaan = new Map<string, CatatanCoba>();

/** false = sedang dikunci (termasuk bila PIN-nya benar). */
export function bolehCoba(kunci: string): boolean {
  const c = percobaan.get(kunci);
  if (!c) return true;
  if (Date.now() < c.kunciSampai) return false;
  if (c.gagal >= MAKS_GAGAL) {
    // Masa kunci habis: beri kesempatan baru.
    percobaan.set(kunci, { gagal: 0, kunciSampai: 0 });
  }
  return true;
}

export function catatGagal(kunci: string): void {
  const c = percobaan.get(kunci) ?? { gagal: 0, kunciSampai: 0 };
  c.gagal += 1;
  if (c.gagal >= MAKS_GAGAL) c.kunciSampai = Date.now() + KUNCI_MS;
  percobaan.set(kunci, c);
}

export function resetPercobaan(kunci: string): void {
  percobaan.delete(kunci);
}

// ---------- Cap jumlah per jendela waktu ----------

type Jendela = { menit: number; jumlah: number };

function capLewat(peta: Map<string, Jendela>, kunci: string, maks: number): boolean {
  const menit = Math.floor(Date.now() / 60000);
  const c = peta.get(kunci);
  if (!c || c.menit !== menit) {
    peta.set(kunci, { menit, jumlah: 1 });
    return false;
  }
  c.jumlah += 1;
  return c.jumlah > maks;
}

const pesananPerMenit = new Map<string, Jendela>();
const fotoPerMenit = new Map<string, Jendela>();

/** true = melewati batas (tolak pesanan). 30 pesanan/menit per resto. */
export function pesananMelewatiBatas(restoId: string): boolean {
  return capLewat(pesananPerMenit, restoId, 30);
}

/** true = melewati batas (tolak foto). 60 foto/menit per IP. */
export function fotoMelewatiBatas(ip: string): boolean {
  return capLewat(fotoPerMenit, ip, 60);
}

/** Salinan baris restoran tanpa kolom PIN (untuk respons API). */
export function tanpaPin<T extends object>(r: T): Omit<T, "owner_pin" | "kasir_pin" | "dapur_pin"> {
  const salin = { ...r } as Record<string, unknown>;
  delete salin.owner_pin;
  delete salin.kasir_pin;
  delete salin.dapur_pin;
  return salin as Omit<T, "owner_pin" | "kasir_pin" | "dapur_pin">;
}

// ---------- Sesi admin (cookie HMAC dari ADMIN_PIN) ----------

async function kunciAdmin(): Promise<CryptoKey | null> {
  const pin = process.env.ADMIN_PIN ?? "";
  if (!pin) return null;
  return crypto.subtle.importKey("raw", utf8(`resto-admin:${pin}`), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
}

async function tokenAdmin(): Promise<string | null> {
  const kunci = await kunciAdmin();
  if (!kunci) return null;
  const tanda = await crypto.subtle.sign("HMAC", kunci, utf8("admin"));
  return keHex(tanda);
}

/** Nilai cookie yang dipasang /api/admin/verify saat PIN benar. */
export async function buatCookieAdmin(): Promise<string | null> {
  const token = await tokenAdmin();
  if (!token) return null;
  // Tanpa flag Secure supaya tetap jalan di localhost (http) saat
  // pengembangan; di Vercel (https) cookie httpOnly + SameSite=Lax ini
  // tidak bisa dibaca JavaScript halaman.
  return `${NAMA_COOKIE_ADMIN}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`;
}

/** true bila request membawa cookie sesi admin yang sah. */
export async function adminSesiValid(request: Request): Promise<boolean> {
  const token = await tokenAdmin();
  if (!token) return false;
  const cookie = request.headers.get("cookie") ?? "";
  const cocok = cookie
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${NAMA_COOKIE_ADMIN}=`));
  if (!cocok) return false;
  const nilai = cocok.slice(NAMA_COOKIE_ADMIN.length + 1);
  if (nilai.length !== token.length) return false;
  let beda = 0;
  for (let i = 0; i < nilai.length; i++) beda |= nilai.charCodeAt(i) ^ token.charCodeAt(i);
  return beda === 0;
}
