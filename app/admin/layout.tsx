import AdminGate from "@/components/AdminGate";

// Semua halaman /admin/* lewat gerbang PIN admin, kecuali halaman staf
// (kasir, POS, dapur, struk) yang dilewati AdminGate karena sudah punya
// gerbang PIN per peran sendiri.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Latar admin putih polos (menutup latar kertas body), berlaku untuk semua
  // halaman /admin/* termasuk daftar resto, dashboard, kasir, dan dapur.
  return (
    <AdminGate>
      <div className="min-h-screen w-full bg-white">{children}</div>
    </AdminGate>
  );
}
