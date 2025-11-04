"use client";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Zustand persist middleware가 자동으로 localStorage를 처리하므로
  // 별도 작업 불필요
  
  return <>{children}</>;
}

