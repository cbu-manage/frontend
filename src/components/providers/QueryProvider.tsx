"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { Toaster, toast } from "sonner";

const DEFAULT_ERROR_MESSAGE =
  "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";

/** 인터셉터가 err.message에 백엔드 메시지를 넣어줌(client.ts). 없으면 기본 문구. */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return DEFAULT_ERROR_MESSAGE;
}

/** 401은 인증 인터셉터(토큰 재발급/로그인 리다이렉트)가 처리하므로 토스트 생략 */
function isAuthError(error: unknown): boolean {
  return (error as AxiosError)?.response?.status === 401;
}

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // 조회 실패 → 메시지 토스트 + 재시도 액션 (같은 쿼리는 id로 묶어 중복 방지)
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (isAuthError(error)) return;
            toast.error(getErrorMessage(error), {
              id: `query-error-${query.queryHash}`,
              action: { label: "재시도", onClick: () => void query.fetch() },
            });
          },
        }),
        // 변경(등록·수정·삭제) 실패 → 메시지 토스트
        mutationCache: new MutationCache({
          onError: (error) => {
            if (isAuthError(error)) return;
            toast.error(getErrorMessage(error));
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
