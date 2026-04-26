import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Salero | POS Digital",
  description: "Aplikasi manajemen penjualan dan operasional Salero",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-primary/10 selection:text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
