import AdminGate from "@/components/AdminGate";

// Halaman Cari Lead hanya untuk tim RestoLauncher.
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
