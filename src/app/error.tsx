"use client";

import { useEffect } from "react";
import ErrorFallback from "@/components/common/ErrorFallback";

interface ErrorProps {
  error: Error & { digest?: string; response?: { data?: { message?: string } } };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("error.tsx caught:", error);
  }, [error]);

  const message = error.response?.data?.message ?? error.message;

  return <ErrorFallback message={message} reset={reset} />;
}
