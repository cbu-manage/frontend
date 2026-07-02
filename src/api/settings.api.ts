/**
 * 시스템 설정 API
 */
import { api } from "./client";
import { type ApiEnvelope } from "./auth.api";

/** 합격/승인 안내 메일에 들어가는 온보딩 링크 */
export type OnboardingLinks = {
  frontendUrl: string;
  openChatUrl: string;
  discordUrl: string;
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
};
