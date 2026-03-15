"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api";

export default function Header() {
  const pathname = usePathname();
  const name = useUserStore((s) => s.name);
  const isAdmin = useUserStore((s) => s.isAdmin);
  const clearUser = useUserStore((s) => s.clearUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isLoggedIn = !!name;

  const isBlockHeader = pathname === "/memberManage";
  const isHome = pathname === "/";

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // 무시
    }
    clearUser();
    clearAuth();
    // 토큰은 authStore(쿠키)에만 저장되므로 clearAuth로 제거됨
    alert("로그아웃 되었습니다.");
    window.location.href = "/";
  };

  const navItems = [
    { name: "스터디 모집", path: "/study" },
    { name: "프로젝트 모집", path: "/project" },
    { name: "코딩테스트 준비", path: "/coding-test" },
    { name: "보고서 업로드", path: "/report" },
    { name: "자료방", path: "/archive" },
  ];

  return (
    <header
      className={
        isBlockHeader
          ? "border-b border-gray-200"
          : `sticky top-0 w-full z-40 border-b ${isHome ? "bg-[#151517] border-transparent" : "bg-gray-0 border-gray-200"}`
      }
    >
      <div
        className={`flex items-center gap-8 px-[9.375%] py-6 min-w-[1200px] ${isHome ? "bg-[#151517]" : "bg-gray-0"}`}
      >
        <Link href="/" className="shrink-0">
          <img src="/assets/logo.png" alt="로고이미지" className="h-8 w-auto" />
        </Link>
        <nav className="hidden md:flex flex-1 justify-center">
          <ul className={`flex items-center gap-8 text-base font-medium ${isHome ? "text-white" : "text-gray-700"}`}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`transition-colors ${isHome ? "hover:text-brand" : "hover:text-brand"} ${
                    pathname.startsWith(item.path)
                      ? "text-brand font-semibold"
                      : isHome
                        ? "text-white"
                        : "text-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-4 justify-end flex-1 md:flex-none">
          {!isLoggedIn ? (
            <Link
              href="/login"
              className={`flex items-center justify-center px-3 py-1.5 gap-[7px] rounded-lg text-base font-semibold leading-[140%] tracking-[-0.06px] transition-colors ${
                isHome
                  ? "bg-white text-black hover:opacity-90"
                  : "bg-brand text-white hover:opacity-90"
              }`}
            >
              로그인
            </Link>
          ) : (
            <>
              <Link
                href={isAdmin ? "/manage" : "/user"}
                className={`transition-colors hover:text-brand ${
                  (isAdmin ? pathname.startsWith("/manage") : pathname.startsWith("/user"))
                    ? "text-brand font-semibold"
                    : isHome ? "text-white font-medium" : "text-gray-700 font-medium"
                }`}
              >
                {isAdmin ? "관리자 페이지" : "마이페이지"}
              </Link>
              <button
                onClick={handleLogout}
                className={`flex items-center justify-center px-3 py-1.5 gap-[7px] rounded-lg text-base font-semibold leading-[140%] tracking-[-0.06px] transition-colors ${
                  isHome
                    ? "bg-white text-black hover:opacity-90"
                    : "bg-brand text-white hover:opacity-90"
                }`}
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
