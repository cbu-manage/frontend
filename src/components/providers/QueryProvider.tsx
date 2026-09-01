"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            /**
             * 권한 없음(401/403)·없는 리소스(404)는 다시 요청해도 결과가 같다.
             * 기본 3회 재시도가 걸리면 화면이 스켈레톤에 오래 머물고 요청만 쌓인다.
             */
            retry: (failureCount, error) => {
              const status = (
                error as { response?: { status?: number } } | undefined
              )?.response?.status;
              if (status && [400, 401, 403, 404, 409].includes(status)) {
                return false;
              }
              return failureCount < 1;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
