import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authCookieStorage } from "@/lib/cookie";

type AuthStore = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
};

/** 토큰을 쿠키에 저장해 새로고침/탭 닫았다 열어도 유지 */
const cookieStorage = createJSONStorage<{ accessToken: string | null }>(() => ({
  getItem: () => authCookieStorage.getItem(),
  setItem: (_name, value) => authCookieStorage.setItem("authStore", value),
  removeItem: () => authCookieStorage.removeItem(),
}));

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      setAccessToken: (token) => set({ accessToken: token }),
      clearAuth: () => set({ accessToken: null }),
    }),
    {
      name: "authStore",
      storage: cookieStorage,
      partialize: (state) => ({ accessToken: state.accessToken }),
    }
  )
);
