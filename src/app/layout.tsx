import type { Metadata, Viewport } from "next";
import { displayFont, scriptFont, serifFont } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lễ Đính Hôn — Annie & Dũng",
  description:
    "Thiệp mời lễ đính hôn của Thanh Tuyền (Annie) & Trí Dũng — 02.01.2027",
  openGraph: {
    title: "Lễ Đính Hôn — Annie & Dũng",
    description: "Nhấn để mở thiệp mời lễ đính hôn",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#3d1418",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${serifFont.variable} ${displayFont.variable} ${scriptFont.variable} ${serifFont.className}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/assets/envelope-closed.webp"
          type="image/webp"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/assets/envelope-open.webp"
          type="image/webp"
        />
        <link
          rel="preload"
          as="image"
          href="/assets/lace-frame.webp"
          type="image/webp"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
