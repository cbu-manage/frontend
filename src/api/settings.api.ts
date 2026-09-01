/**
 * 시스템 설정 API
 */
import { api } from "./client";
import { type ApiEnvelope } from "./auth.api";

/** 합격/승인 안내 메일에 들어가는 온보딩 링크 */
export type OnboardingLinks = {
  frontendUrl: string;
  /** 회비 확인 및 문의 방 (서버 저장 키는 OPEN_CHAT_URL) */
  openChatUrl: string;
  discordUrl: string;
  /** 카카오톡 공지방 */
  kakaoNotiUrl: string;
  /** 카카오톡 수다방 */
  kakaoChatUrl: string;
};

/** 회비·입금 계좌 안내 (지원자 `/apply/fee` 노출용) */
export type FeeInfo = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  /** 회비 금액(원) */
  feeAmount: number;
  /** 감면 금액(원) — 휴학·졸업생 */
  discountAmount: number;
  /** 납부 마감일 yyyy-MM-dd */
  paymentDeadline: string;
};

export const settingsApi = {
  /** 온보딩 링크 조회 — 회장/부회장/ADMIN */
  getOnboardingLinks: () =>
    api.get<ApiEnvelope<OnboardingLinks>>("/admin/settings/onboarding-links"),

  /** 온보딩 링크 수정 */
  updateOnboardingLinks: (data: OnboardingLinks) =>
    api.put<ApiEnvelope<OnboardingLinks>>(
      "/admin/settings/onboarding-links",
      data,
    ),

  /** 온보딩 링크 공개 조회 — 합격자·신규 회원 안내 화면용 (비로그인 허용) */
  getPublicOnboardingLinks: () =>
    api.get<ApiEnvelope<OnboardingLinks>>("/onboarding-links"),

  /** 회비 안내 공개 조회 — 비로그인 지원자용. 미등록이면 404(E-FEE-0001) */
  getPublicFeeInfo: () => api.get<ApiEnvelope<FeeInfo>>("/fee-info"),

  /** 회비 안내 조회 — 회장/부회장/총무/ADMIN. 미등록이면 404(E-FEE-0001) */
  getFeeInfo: () => api.get<ApiEnvelope<FeeInfo>>("/admin/settings/fee-info"),

  /** 회비 안내 등록/수정 (없으면 생성) */
  updateFeeInfo: (data: FeeInfo) =>
    api.put<ApiEnvelope<FeeInfo>>("/admin/settings/fee-info", data),
};
