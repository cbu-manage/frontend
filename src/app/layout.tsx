import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import QueryProvider from "@/components/providers/QueryProvider";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "씨부엉 공식 홈페이지",
  description: "한국공학대학교 프로그래밍 동아리 씨부엉",
  icons: {
    icon: "/favicon.png",
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
