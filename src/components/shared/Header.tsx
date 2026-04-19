"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { authApi } from "@/api";

export default function Header() {
  const pathname = usePathname();
  const name = useUserStore((s) => s.name);
  const isAdmin = useUserStore((s) => s.isAdmin);
  const clearUser = useUserStore((s) => s.clearUser);
  const isLoggedIn = !!name;

  const isBlockHeader = pathname === "/memberManage";
  const isHome = pathname === "/";

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // 무시
    }
    clearUser();
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
        className={`flex items-center gap-4 md:gap-8 container-x py-4 md:py-6 ${isHome ? "bg-[#151517]" : "bg-gray-0"}`}
      >
        <Link href="/" className="shrink-0">
          <img src="/assets/logo.png" alt="로고이미지" className="h-7 md:h-8 w-auto" />
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

        <div className="hidden md:flex items-center gap-4 justify-end flex-none">
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

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={mobileOpen}
          className={`md:hidden ml-auto inline-flex items-center justify-center w-11 h-11 rounded-lg -mr-2 ${
            isHome ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {mobileOpen ? <X width={24} height={20} /> : <Menu width={24} height={20} />}
        </button>
      </div>

      {mobileOpen && (
        <>
          <div
            className="md:hidden absolute left-0 right-0 top-full h-screen bg-black/40 z-30"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`md:hidden absolute left-0 right-0 top-full z-40 border-t ${
              isHome ? "bg-[#151517] border-white/10" : "bg-gray-0 border-gray-200"
            }`}
          >
            <nav className="px-4 py-3">
              <ul className="flex flex-col">
                {navItems.map((item) => {
                  const active = pathname.startsWith(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`block px-3 py-3 rounded-lg text-base font-medium ${
                          active
                            ? "text-brand font-semibold"
                            : isHome
                              ? "text-white hover:bg-white/10"
                              : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className={`mt-3 pt-3 border-t ${isHome ? "border-white/10" : "border-gray-200"} flex flex-col gap-2`}>
                {!isLoggedIn ? (
                  <Link
                    href="/login"
                    className={`flex items-center justify-center px-3 py-3 rounded-lg text-base font-semibold ${
                      isHome ? "bg-white text-black" : "bg-brand text-white"
                    }`}
                  >
                    로그인
                  </Link>
                ) : (
                  <>
                    <Link
                      href={isAdmin ? "/manage" : "/user"}
                      className={`flex items-center justify-center px-3 py-3 rounded-lg text-base font-medium ${
                        isHome ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {isAdmin ? "관리자 페이지" : "마이페이지"}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`flex items-center justify-center px-3 py-3 rounded-lg text-base font-semibold ${
                        isHome ? "bg-white text-black" : "bg-brand text-white"
                      }`}
                    >
                      로그아웃
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
