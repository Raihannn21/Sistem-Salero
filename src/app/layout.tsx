import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Salero | Sistem Manajemen HPP",
  description: "Aplikasi perhitungan HPP dan manajemen penjualan Nasi Padang Salero",
  icons: {
    icon: [
      { url: "/salero-logo.png?v=2", href: "/salero-logo.png?v=2" },
    ],
    shortcut: ["/salero-logo.png?v=2"],
    apple: [
      { url: "/salero-logo.png?v=2", href: "/salero-logo.png?v=2" },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* Cache-busting favicon link to force browser update */}
        <link rel="icon" href="/salero-logo.png?v=2" />
        <link rel="shortcut icon" href="/salero-logo.png?v=2" />
        <link rel="apple-touch-icon" href="/salero-logo.png?v=2" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
