import AdminGate from "@/components/AdminGate";

// Halaman operator bergate PIN: jangan di-prerender sebagai halaman statis.
export const dynamic = "force-dynamic";

// Halaman Cari Lead hanya untuk tim RestoLauncher.
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
