// Tipe & helper aman untuk client dan server (tanpa akses env).
export const ORDER_STATUSES = ["baru", "dikonfirmasi", "selesai", "batal"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const TRIAL_DAYS = 14;

export const TEMPLATES = ["minimal", "dark", "bold", "warm", "amok", "amak", "patachou", "elegan"] as const;
export type RestaurantTemplate = (typeof TEMPLATES)[number];
export const TEMPLATE_LABELS: Record<RestaurantTemplate, string> = {
  minimal: "Minimal",
  dark: "Dark Elegant",
  bold: "Bold",
  warm: "Warm",
  amok: "Amok",
  amak: "Amak",
  patachou: "Patachou",
  elegan: "Elegan",
};
export const TEMPLATE_DESCRIPTIONS: Record<RestaurantTemplate, string> = {
  minimal: "Putih bersih, lega",
  dark: "Gelap, aksen emas",
  bold: "Berani, kartu besar",
  warm: "Krem, cozy, serif",
  amok: "Hijau gelap, promo kopi",
  amak: "Hitam & tan, premium",
  patachou: "Putih bersih, aksen kuning",
  elegan: "Krem elegan, foto menu, oranye",
};

export function toTemplate(v: unknown): RestaurantTemplate {
  return TEMPLATES.includes(v as RestaurantTemplate) ? (v as RestaurantTemplate) : "minimal";
}

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  primary_color: string | null;
  maps_url: string | null;
  template: RestaurantTemplate | null;
  instagram: string | null;
  tiktok: string | null;
  qris_payload: string | null;
  opening_hours: string | null;
  about_text: string | null;
  package: "basic" | "plus" | "premium" | null;
  owner_pin: string | null;
  kasir_pin: string | null;
  dapur_pin: string | null;
  promo_title: string | null;
  promo_text: string | null;
  promo_image_url: string | null;
  created_at: string;
};

export const PACKAGES = ["basic", "plus", "premium"] as const;
export type Package = (typeof PACKAGES)[number];
export const PACKAGE_LABELS: Record<Package, string> = {
  basic: "Basic",
  plus: "Plus",
  premium: "Premium",
};

export type RestaurantTable = {
  id: string;
  restaurant_id: string;
  name: string;
  seats: number | null;
};

export const ORDER_TYPES = ["dine_in", "takeaway", "delivery"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];
export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  dine_in: "Dine-in",
  takeaway: "Takeaway",
  delivery: "Delivery",
};

export const PAYMENT_METHODS = ["cash", "qris", "transfer"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Tunai",
  qris: "QRIS",
  transfer: "Transfer",
};

export const PAYMENT_STATUSES = ["unpaid", "paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// Terima @handle atau URL penuh; kembalikan URL profil.
export function instagramUrl(v: string | null | undefined): string | null {
  const s = v?.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  return `https://instagram.com/${s.replace(/^@/, "")}`;
}

export function tiktokUrl(v: string | null | undefined): string | null {
  const s = v?.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  return `https://www.tiktok.com/@${s.replace(/^@/, "")}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

export type Subscription = {
  id: string;
  restaurant_id: string;
  plan: "trial" | "permanent";
  trial_ends_at: string | null;
};

export type RestaurantWithSub = Restaurant & { subscription: Subscription | null };

export type VariantOption = { name: string; price_delta: number };
export type VariantGroup = { label: string; options: VariantOption[] };
export type MenuAddon = { name: string; price: number };

export type MenuItem = {
  id: string;
  restaurant_id: string;
  category: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
  variants: VariantGroup[];
  addons: MenuAddon[];
};

export type OrderLine = { item_id: string; name: string; price: number; qty: number };

export type Order = {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone: string;
  items: OrderLine[];
  total: number;
  discount: number;
  cash_received: number | null;
  status_note: string | null;
  queue_no: number | null;
  status: OrderStatus;
  table_id: string | null;
  order_type: OrderType | null;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus | null;
  created_at: string;
};

export type Shift = {
  id: string;
  restaurant_id: string;
  opened_at: string;
  closed_at: string | null;
  opening_cash: number;
  cash_in: number;
  cash_out: number;
  closing_cash: number | null;
  note: string | null;
  created_at: string;
};

export type SubStatus = "trial" | "permanent" | "expired";

export function subStatus(sub: Subscription | null | undefined, now = Date.now()): SubStatus {
  if (!sub) return "expired";
  if (sub.plan === "permanent") return "permanent";
  if (sub.trial_ends_at && new Date(sub.trial_ends_at).getTime() > now) return "trial";
  return "expired";
}

export function toWaNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  return digits;
}

export function formatRupiah(n: number): string {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}
