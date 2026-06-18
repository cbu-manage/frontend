import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type UserInfo = {
  userId: string; // 서버 식별자(uuid). 본인 게시물 판별(authorId 비교)용 — useIsAuthor 참고
  role: string; // 서버가 내려주는 권한 문자열 (권한 세분화용). isAdmin은 이걸로 파생
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

type SetUserInfo = Partial<UserInfo>;

type UserStore = UserInfo & {
  setUser: (info: SetUserInfo) => void;
  setAuthStatus: (status: AuthStatus) => void;
  updateEmail: (email: string) => void;
  clearUser: () => void;
};

const initialState: UserInfo = {
  userId: '',
  role: '',
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
        set((s) => ({
          ...s,
          userId: info.userId ?? s.userId,
          role: info.role ?? s.role,
          name: info.name ?? s.name,
          studentNumber: info.studentNumber ?? s.studentNumber,
          email: info.email ?? s.email,
          major: info.major ?? s.major,
          grade: info.grade ?? s.grade,
          nickName: info.nickName ?? s.nickName,
          isAdmin: info.isAdmin ?? s.isAdmin,
        })),
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
        userId: state.userId,
        role: state.role,
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


