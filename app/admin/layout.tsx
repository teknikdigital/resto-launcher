import AdminGate from "@/components/AdminGate";

// Halaman admin bergate PIN: jangan di-prerender sebagai halaman statis.
export const dynamic = "force-dynamic";

// Semua halaman /admin/* lewat gerbang PIN admin, kecuali halaman staf
// (kasir, POS, dapur, struk) yang dilewati AdminGate karena sudah punya
// gerbang PIN per peran sendiri.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
