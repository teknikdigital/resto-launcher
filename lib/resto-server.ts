// Helper server untuk restoran/subscription. Jangan diimpor dari komponen client.
import { supabaseRest } from "./supabase";
import {
  subStatus,
  TEMPLATES,
  TRIAL_DAYS,
  type MenuItem,
  type OrderLine,
  type Restaurant,
  type RestaurantTable,
  type RestaurantTemplate,
  type Subscription,
} from "./resto-types";

const q = encodeURIComponent;

export const RESTAURANT_FIELDS = [
  "slug",
  "name",
  "description",
  "logo_url",
  "cover_url",
  "address",
  "phone",
  "whatsapp",
  "primary_color",
  "maps_url",
  "template",
  "instagram",
  "tiktok",
  "opening_hours",
  "about_text",
  "qris_payload",
] as const;

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

// Ambil field restoran dari body; kembalikan pesan error bila tidak valid.
export function parseRestaurantBody(
  body: Record<string, unknown> | null,
  partial: boolean,
): { data: Record<string, string | null> } | { error: string } {
  if (!body) return { error: "Body tidak valid" };
  const data: Record<string, string | null> = {};
  for (const f of RESTAURANT_FIELDS) {
    if (body[f] === undefined) continue;
    data[f] = str(body[f]);
  }
  if (!partial || "slug" in data) {
    const slug = data.slug?.toLowerCase() ?? "";
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      return { error: "Slug hanya huruf kecil, angka, dan tanda hubung" };
    }
    data.slug = slug;
  }
  if (!partial && !data.name) return { error: "Nama wajib diisi" };
  if ("name" in data && !data.name) return { error: "Nama wajib diisi" };
  if (data.primary_color && !/^#[0-9a-fA-F]{6}$/.test(data.primary_color)) {
    return { error: "Warna harus format #RRGGBB" };
  }
  if ("template" in data) {
    if (!data.template) delete data.template;
    else if (!TEMPLATES.includes(data.template as RestaurantTemplate)) return { error: "Tema tidak valid" };
  }
  if (data.maps_url &&!/^https?:\/\//i.test(data.maps_url)) {
    return { error: "Link Google Maps harus diawali http:// atau https://" };
  }
  // QRIS statis restoran: harus terlihat seperti payload QRIS bila diisi.
  if (data.qris_payload && !/^000201/.test(data.qris_payload)) {
    return { error: "QRIS tidak valid: payload harus diawali 000201" };
  }
  // Foto sampul: URL penuh atau path proxy foto Google (/api/places/photo?...).
  if (data.cover_url && !/^(https?:\/\/|\/api\/places\/photo\?)/i.test(data.cover_url)) {
    return { error: "Foto sampul harus berupa URL yang diawali http:// atau https://" };
  }
  return { data };
}

export type SupabaseErrorBody = { message?: string; code?: string; details?: string; hint?: string };

// Error "duplicate key" pada kolom slug (unique constraint restaurants_slug_key).
export function isSlugConflict(e: SupabaseErrorBody | undefined): boolean {
  return e?.code === "23505" && /slug/i.test(`${e.message ?? ""} ${e.details ?? ""}`);
}

// Slug bebas terdekat: base, base-2, base-3, dst. `excludeId` = restoran yang sedang diedit.
export async function findFreeSlug(base: string, excludeId?: string): Promise<string> {
  const res = await supabaseRest(`restaurants?select=id,slug&slug=like.${q(base)}*&limit=1000`);
  if (!res.ok) throw await res.json().catch(() => ({ message: res.statusText }));
  const rows: { id: string; slug: string }[] = await res.json();
  const taken = new Set(rows.filter((r) => r.id !== excludeId).map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  }
}

export function addDays(base: Date, days: number): string {
  return new Date(base.getTime() + days * 86_400_000).toISOString();
}

export async function fetchSubscriptions(restaurantIds?: string[]): Promise<Subscription[]> {
  const filter = restaurantIds ? `?restaurant_id=in.(${restaurantIds.map(q).join(",")})` : "";
  if (restaurantIds && restaurantIds.length === 0) return [];
  const res = await supabaseRest(`subscriptions${filter}`);
  if (!res.ok) throw await res.json().catch(() => ({ message: res.statusText }));
  return res.json();
}

export async function fetchRestaurantById(id: string): Promise<Restaurant | null> {
  const res = await supabaseRest(`restaurants?id=eq.${q(id)}&limit=1`);
  if (!res.ok) throw await res.json().catch(() => ({ message: res.statusText }));
  const rows = await res.json();
  return rows[0] ?? null;
}

export function parseMenuBody(
  body: Record<string, unknown> | null,
  partial: boolean,
): { data: Record<string, unknown> } | { error: string } {
  if (!body) return { error: "Body tidak valid" };
  const data: Record<string, unknown> = {};

  for (const f of ["category", "description", "image_url"] as const) {
    if (body[f] !== undefined) data[f] = str(body[f]);
  }
  if (body.name !== undefined || !partial) {
    const name = str(body.name);
    if (!name) return { error: "Nama menu wajib diisi" };
    data.name = name;
  }
  if (body.price !== undefined || !partial) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) return { error: "Harga tidak valid" };
    data.price = price;
  }
  if (body.is_available !== undefined) data.is_available = Boolean(body.is_available);
  if (body.sort_order !== undefined) {
    const n = Number(body.sort_order);
    if (!Number.isInteger(n)) return { error: "Urutan harus bilangan bulat" };
    data.sort_order = n;
  }
  return { data };
}

// Validasi item keranjang lalu hitung ulang harga/total dari menu_items di DB.
// Melempar error Supabase mentah bila query gagal (ditangkap caughtErrorResponse).
export async function buildOrderLines(
  restaurantId: string,
  rawItems: unknown,
): Promise<{ lines: OrderLine[]; total: number } | { error: string; status: number }> {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 100) {
    return { error: "Keranjang kosong", status: 400 };
  }
  const qty = new Map<string, number>();
  for (const it of rawItems) {
    const itemId = (it as { item_id?: unknown })?.item_id;
    const n = Number((it as { qty?: unknown })?.qty);
    if (typeof itemId !== "string" || !Number.isInteger(n) || n < 1 || n > 99) {
      return { error: "Item pesanan tidak valid", status: 400 };
    }
    qty.set(itemId, (qty.get(itemId) ?? 0) + n);
  }

  const [sub] = await fetchSubscriptions([restaurantId]);
  if (subStatus(sub) === "expired") return { error: "Restoran ini sudah tidak aktif", status: 403 };

  const menuRes = await supabaseRest(`menu_items?restaurant_id=eq.${q(restaurantId)}&is_available=eq.true`);
  if (!menuRes.ok) throw await menuRes.json().catch(() => ({ message: menuRes.statusText }));
  const menu: MenuItem[] = await menuRes.json();
  const byId = new Map(menu.map((m) => [m.id, m]));

  const lines: OrderLine[] = [];
  for (const [itemId, n] of qty) {
    const m = byId.get(itemId);
    if (!m) return { error: "Ada menu yang tidak tersedia", status: 400 };
    lines.push({ item_id: m.id, name: m.name, price: Number(m.price), qty: n });
  }
  return { lines, total: lines.reduce((s, l) => s + l.price * l.qty, 0) };
}

export async function fetchTables(restaurantId: string, extra = ""): Promise<RestaurantTable[]> {
  const res = await supabaseRest(`tables?restaurant_id=eq.${q(restaurantId)}${extra}`);
  if (!res.ok) throw await res.json().catch(() => ({ message: res.statusText }));
  return res.json();
}

export function parseTableBody(
  body: Record<string, unknown> | null,
  partial: boolean,
): { data: { name?: string; seats?: number | null } } | { error: string } {
  if (!body) return { error: "Body tidak valid" };
  const data: { name?: string; seats?: number | null } = {};
  if (body.name !== undefined || !partial) {
    const name = str(body.name);
    if (!name) return { error: "Nama meja wajib diisi" };
    data.name = name;
  }
  if (body.seats !== undefined) {
    if (body.seats === null || body.seats === "") data.seats = null;
    else {
      const n = Number(body.seats);
      if (!Number.isInteger(n) || n < 1 || n > 999) return { error: "Jumlah kursi tidak valid" };
      data.seats = n;
    }
  }
  return { data };
}

export function newTrial(restaurantId: string) {
  return { restaurant_id: restaurantId, plan: "trial", trial_ends_at: addDays(new Date(), TRIAL_DAYS) };
}
