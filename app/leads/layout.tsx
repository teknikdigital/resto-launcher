import AdminGate from "@/components/AdminGate";

// Halaman operator bergate PIN: jangan di-prerender sebagai halaman statis.
export const dynamic = "force-dynamic";

// Halaman Daftar Lead hanya untuk tim RestoLauncher.
export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
