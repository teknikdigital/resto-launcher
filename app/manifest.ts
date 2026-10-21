import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RestoLauncher — Menu Digital & Pemesanan",
    short_name: "RestoLauncher",
    description: "Menu digital QR, pemesanan dari meja, dan QRIS untuk restoran Indonesia.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF6EF",
    theme_color: "#1B5E3B",
    icons: [
      { src: "/favicon.png", sizes: "256x256", type: "image/png", purpose: "any" },
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
