"use client";

import { useEffect } from "react";
import ErrorFallback from "@/components/common/ErrorFallback";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("error.tsx caught:", error);
  }, [error]);

  return <ErrorFallback status={500} reset={reset} error={error} />;
}
