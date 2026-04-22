"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("global-error.tsx caught:", error);
  }, [error]);

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
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          서버에서 오류가 발생했어요
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
          일시적인 문제가 생겼어요. 잠시 후 다시 시도해 주세요.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.75rem 2rem",
            borderRadius: "8px",
            background: "#222222",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: 500,
          }}
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
