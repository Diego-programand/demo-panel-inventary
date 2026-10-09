import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "DemoPanel Inventory OS — Enterprise Multi-Niche Showcase",
  description:
    "Plataforma demostrativa de gestión de inventario empresarial de alto impacto visual y funcional con experiencia de usuario Apple HIG para Retail, Farmacia, Tecnología y Alimentos.",
  keywords: [
    "inventory management",
    "apple hig",
    "enterprise showcase",
    "kardex",
    "retail",
    "pharma",
    "electronics",
    "food",
    "nextjs",
  ],
  authors: [{ name: "Diego-programand" }],
  openGraph: {
    title: "DemoPanel Inventory OS — Enterprise Multi-Niche Showcase",
    description:
      "Panel de gestión de inventario de grado Apple con diseño Liquid Glass, auditoría inmutable de Kardex y conmutación multidominio en tiempo real.",
    type: "website",
    locale: "es_CO",
    siteName: "DemoPanel Inventory OS",
  },
  twitter: {
    card: "summary_large_image",
    title: "DemoPanel Inventory OS — Enterprise Multi-Niche Showcase",
    description:
      "Panel de gestión de inventario de grado Apple con diseño Liquid Glass, auditoría inmutable de Kardex y conmutación multidominio en tiempo real.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

