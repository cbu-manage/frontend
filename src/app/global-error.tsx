"use client";

import { useEffect } from "react";
import Link from "next/link";

interface GlobalErrorProps {
  error: Error & { digest?: string; response?: { data?: { message?: string } } };
  reset: () => void;
}

const buttonStyle: React.CSSProperties = {
  padding: "0.75rem 2rem",
  borderRadius: "8px",
  background: "#222222",
  color: "#ffffff",
  border: "none",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: 500,
  textDecoration: "none",
  display: "inline-block",
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("global-error.tsx caught:", error);
  }, [error]);

  const message = error.response?.data?.message ?? error.message;

  return (
    <html lang="ko">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <p style={{ color: "#6b7280", marginBottom: "2rem", whiteSpace: "pre-line" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={reset} style={buttonStyle}>
            다시 시도
          </button>
          <Link href="/" style={buttonStyle}>
            홈으로 가기
          </Link>
        </div>
      </body>
    </html>
  );
}
