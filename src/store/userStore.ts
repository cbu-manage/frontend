import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type UserInfo = {
  name: string;
  studentNumber: number;
  email: string | null;
  isAdmin: boolean;
  major: string;
  grade: string;
  nickName: string;
  isDefaultPassword: boolean;
  isEmailNull: boolean;
  emailUpdated: boolean;
};

type AuthStatus = { isDefaultPassword: boolean; isEmailNull: boolean };

type UserStore = UserInfo & {
  setUser: (info: Partial<Omit<UserInfo, 'isAdmin'>>) => void;
  setAuthStatus: (status: AuthStatus) => void;
  updateEmail: (email: string) => void;
  clearUser: () => void;
};

const initialState: UserInfo = {
  name: '',
  studentNumber: 0,
  email: null,
  isAdmin: false,
  major: '',
  grade: '',
  nickName: '',
  isDefaultPassword: false,
  isEmailNull: true,
  emailUpdated: false,
};

// 서버 사이드에서 사용할 초기 스냅샷 생성
const createServerSnapshot = (): UserStore => ({
  ...initialState,
  setUser: () => {},
  setAuthStatus: () => {},
  updateEmail: () => {},
  clearUser: () => {},
});

// 서버 사이드 스냅샷 캐시
let cachedServerSnapshot: UserStore | null = null;

export const getServerSnapshot = (): UserStore => {
  if (!cachedServerSnapshot) {
    cachedServerSnapshot = createServerSnapshot();
  }
  return cachedServerSnapshot;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setUser: (info) =>
        set((s) => {
          const name = info.name ?? s.name;
          const email = info.email ?? s.email;
          const isAdmin = name === '관리자' && email === 'cbuAdmin@tukorea.ac.kr';
          return {
            ...s,
            name,
            studentNumber: info.studentNumber ?? s.studentNumber,
            email,
            major: info.major ?? s.major,
            grade: info.grade ?? s.grade,
            nickName: info.nickName ?? s.nickName,
            isAdmin,
          };
        }),
      setAuthStatus: (status) =>
        set((s) => ({
          ...s,
          isDefaultPassword: status.isDefaultPassword,
          isEmailNull: status.isEmailNull,
        })),
      updateEmail: (email) =>
        set((s) => ({
          ...s,
          email,
          isEmailNull: false,
          emailUpdated: true,
        })),
      clearUser: () => set(() => ({ ...initialState })),
    }),
    {
      name: 'userStore',
      storage: createJSONStorage(() => {
        // 서버 사이드에서는 localStorage가 없으므로 안전하게 처리
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        name: state.name,
        studentNumber: state.studentNumber,
        email: state.email,
        isAdmin: state.isAdmin,
        major: state.major,
        grade: state.grade,
        nickName: state.nickName,
      }),
    }
  )
);


