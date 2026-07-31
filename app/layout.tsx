import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "音逢｜中日谐音文化小志",
  description: "在声音里遇见另一种语言：收集中日之间有趣的谐音、音读与文化回声。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "音逢｜中日谐音文化小志",
    description: "在声音里，遇见另一种语言。",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "音逢分享封面" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "音逢｜中日谐音文化小志",
    description: "在声音里，遇见另一种语言。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
