"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { authApi } from "@/api/auth.api";
import { useUserStore } from "@/store/userStore";
import { apiErrorMessage } from "@/lib/errorCode";
import { ME_QUERY_KEY } from "./useMe";

/**
 * 회원 탈퇴 — 서버 소프트 삭제 + 인증 쿠키 삭제 후 로컬 세션을 정리하고 홈으로 보낸다.
 * confirm 은 호출부 몫. 성공·실패 안내와 정리는 여기서 한 번에.
 */
export function useWithdraw() {
  const queryClient = useQueryClient();
  const clearUser = useUserStore((s) => s.clearUser);

  return useMutation({
    mutationFn: async () => {
      // confirm 창이 닫히며 생기는 focus 로 me 가 재조회되면 탈퇴 직후 401 → 인터셉터가 /login 으로 보낸다.
      // 진행 중인 me 요청을 먼저 끊어 두 응답이 서로 다른 곳으로 리다이렉트하는 경합을 막는다.
      await queryClient.cancelQueries({ queryKey: ME_QUERY_KEY });
      await authApi.deleteAccount();
    },
    onSuccess: () => {
      window.alert("탈퇴가 완료되었습니다.");
      // 새 문서로 넘어가기 전에 스토어(localStorage)와 쿼리 캐시를 비운다.
      // clearUser 를 먼저 하면 이동 전 잠깐 "로그인하기" 화면이 그려지므로 이동을 먼저 건다.
      window.location.href = "/";
      clearUser();
      queryClient.clear();
    },
    onError: (err) => {
      // 401 은 인터셉터가 이미 로그아웃·/login 이동을 처리한다 — 여기서 "다시 시도" 를 띄우면 모순된다
      if (err instanceof AxiosError && err.response?.status === 401) return;
      window.alert(
        apiErrorMessage(err, "탈퇴 처리에 실패했습니다. 다시 시도해주세요."),
      );
    },
  });
}
