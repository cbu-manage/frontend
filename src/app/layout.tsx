import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import QueryProvider from "@/components/providers/QueryProvider";
import { Analytics } from "@vercel/analytics/next";

const SITE_URL = "https://www.tukcbu.com";
const SITE_TITLE = "씨부엉 공식 홈페이지";
const SITE_DESCRIPTION = "한국공학대학교 프로그래밍 동아리 씨부엉";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "씨부엉",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "ko_KR",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "씨부엉 — 한국공학대학교 프로그래밍 동아리",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // suppressHydrationWarning: 한컴 HWP 등 브라우저 확장이 <html>에 data-* 속성을 주입해
  // 생기는 hydration mismatch 억제. 최상위 노드 한정이라 내부 진짜 mismatch는 그대로 감지됨.
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        <QueryProvider>
          <Header />
          {children}
          <Footer />
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
