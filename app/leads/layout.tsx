import AdminGate from "@/components/AdminGate";

// Halaman Daftar Lead hanya untuk tim RestoLauncher.
export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
