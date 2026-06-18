"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { authApi } from "@/api";

/**
 * 헤더 네비게이션 — 카테고리(의미 그룹) + 드롭다운.
 * 항목 추가는 이 배열만 수정하면 됨 (예: 아카이브에 명예의 전당).
 */
type NavItem = { name: string; path: string };
type NavCategory = { name: string; items: NavItem[] };

const NAV: NavCategory[] = [
  {
    name: "씨부엉 소식",
    items: [
      { name: "공지사항", path: "/notice" },
      { name: "소식게시판", path: "/news" },
      { name: "자료방", path: "/archive" },
    ],
  },
  {
    name: "네트워킹",
    items: [
      { name: "스터디 모집", path: "/study" },
      { name: "프로젝트 모집", path: "/project" },
      { name: "자유게시판", path: "/board" },
    ],
  },
  {
    name: "알고리즘",
    items: [{ name: "코딩 테스트 준비", path: "/coding-test" }],
  },
  {
    name: "아카이브",
    items: [{ name: "보고서 업로드", path: "/report" }],
  },
];

export default function Header() {
  const pathname = usePathname();
  const name = useUserStore((s) => s.name);
  const isAdmin = useUserStore((s) => s.isAdmin);
  const clearUser = useUserStore((s) => s.clearUser);
  const isLoggedIn = !!name;

  const isBlockHeader = pathname === "/memberManage";
  const isHome = pathname === "/";

  // 모바일 메뉴: 현재 pathname에서 열림 → 이동(경로 변경) 시 파생적으로 닫힘
  const [openedAtPathname, setOpenedAtPathname] = useState<string | null>(null);
  const mobileOpen = openedAtPathname === pathname && openedAtPathname !== null;
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const toggleMenu = () => setOpenedAtPathname(mobileOpen ? null : pathname);
  const closeMenu = () => {
    setOpenedAtPathname(null);
    setExpandedCat(null);
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
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

  const isCategoryActive = (cat: NavCategory) =>
    cat.items.some((i) => pathname.startsWith(i.path));

  // 테마 토큰 (홈=다크, 나머지=라이트). 추후 #177에서 테마 상태 기반으로 일반화.
  const text = isHome ? "text-white" : "text-gray-700";
  const itemHover = isHome
    ? "text-white/90 hover:bg-white/10"
    : "text-gray-700 hover:bg-gray-50";
  const ctaBtn = isHome
    ? "bg-white text-black hover:opacity-90"
    : "bg-brand text-white hover:opacity-90";

  if (isBlockHeader) {
    return <header className="border-b border-gray-200" />;
  }

  return (
    <header
      className={`sticky top-0 w-full z-40 border-b ${
        isHome ? "bg-[#151517] border-transparent" : "bg-gray-0 border-gray-200"
      }`}
    >
      <div className="flex items-center gap-4 md:gap-8 container-x py-4 md:py-6">
        <Link href="/" className="shrink-0">
          <img src="/assets/logo.png" alt="씨부엉" className="h-7 md:h-8 w-auto" />
        </Link>

        {/* 데스크탑 카테고리 네비 — 메가메뉴(헤더 전체폭 펼침) */}
        <nav className="hidden md:flex flex-1 justify-center group/cats">
          <ul className={`flex items-center gap-20 lg:gap-32 text-lg font-semibold ${text}`}>
            {NAV.map((cat) => {
              const active = isCategoryActive(cat);
              return (
                <li key={cat.name} className="group/cat relative">
                  <button
                    type="button"
                    className={`pb-1.5 border-b-4 font-semibold transition-colors ${
                      active
                        ? "border-brand text-brand"
                        : `border-transparent group-hover/cat:text-brand ${isHome ? "text-white" : "text-gray-900"}`
                    }`}
                    aria-haspopup="true"
                  >
                    {cat.name}
                  </button>
                  {/* 항목 — 카테고리 바로 아래 정렬, 셸프 위에 표시 (pt-5=hover 브릿지) */}
                  <div className="invisible opacity-0 group-hover/cat:visible group-hover/cat:opacity-100 group-focus-within/cat:visible group-focus-within/cat:opacity-100 absolute left-1/2 -translate-x-1/2 top-full z-40 pt-5 transition-opacity">
                    <ul className="flex flex-col gap-1 min-w-44">
                      {cat.items.map((item) => {
                        const itemActive = pathname.startsWith(item.path);
                        return (
                          <li key={item.path}>
                            <Link
                              href={item.path}
                              className={`block text-center rounded-xl px-4 py-2.5 text-base font-medium transition-colors ${
                                itemActive
                                  ? "bg-brand/15 text-brand font-semibold"
                                  : isHome
                                    ? "text-white/90 hover:bg-white/10 hover:text-brand"
                                    : "text-gray-700 hover:bg-brand/10 hover:text-brand"
                              }`}
                            >
                              {item.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
          {/* 전체폭 셸프 — 카테고리 hover 시 헤더가 통째로 펼쳐지는 배경 */}
          <div
            aria-hidden="true"
            className={`invisible opacity-0 group-hover/cats:visible group-hover/cats:opacity-100 absolute inset-x-0 top-full z-30 h-44 border-b transition-opacity ${
              isHome ? "bg-[#151517] border-white/10" : "bg-gray-0 border-gray-200"
            }`}
          />
        </nav>

        {/* 데스크탑 우측 — 로그인 상태 */}
        <div className="hidden md:flex items-center gap-4 justify-end flex-none">
          {!isLoggedIn ? (
            <Link
              href="/login"
              className={`flex items-center justify-center px-5 py-2 rounded-lg text-base font-semibold transition-colors ${ctaBtn}`}
            >
              로그인
            </Link>
          ) : (
            <>
              <Link
                href={isAdmin ? "/manage" : "/user"}
                className={`font-medium transition-colors hover:text-brand ${
                  (isAdmin ? pathname.startsWith("/manage") : pathname.startsWith("/user"))
                    ? "text-brand font-semibold"
                    : text
                }`}
              >
                {isAdmin ? "관리자 페이지" : "마이페이지"}
              </Link>
              <button
                onClick={handleLogout}
                className={`flex items-center justify-center px-5 py-2 rounded-lg text-base font-semibold transition-colors ${ctaBtn}`}
              >
                로그아웃
              </button>
            </>
          )}
        </div>

        {/* 모바일 햄버거 */}
        <button
          type="button"
          onClick={toggleMenu}
          aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={mobileOpen}
          className={`md:hidden ml-auto inline-flex items-center justify-center w-11 h-11 rounded-lg -mr-2 ${
            isHome ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {mobileOpen ? <X width={24} height={20} /> : <Menu width={24} height={20} />}
        </button>
      </div>

      {/* 모바일 메뉴 — 카테고리 아코디언 */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden absolute left-0 right-0 top-full h-screen bg-black/40 z-30"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div
            className={`md:hidden absolute left-0 right-0 top-full z-40 border-t max-h-[80vh] overflow-y-auto ${
              isHome ? "bg-[#151517] border-white/10" : "bg-gray-0 border-gray-200"
            }`}
          >
            <nav className="px-4 py-3">
              <ul className="flex flex-col">
                {NAV.map((cat) => {
                  const open = expandedCat === cat.name;
                  const active = isCategoryActive(cat);
                  return (
                    <li key={cat.name}>
                      <button
                        type="button"
                        onClick={() => setExpandedCat(open ? null : cat.name)}
                        aria-expanded={open}
                        className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-base font-semibold ${
                          active ? "text-brand" : text
                        }`}
                      >
                        {cat.name}
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                      {open && (
                        <ul className="pb-1">
                          {cat.items.map((item) => (
                            <li key={item.path}>
                              <Link
                                href={item.path}
                                className={`block pl-6 pr-3 py-2.5 rounded-lg text-sm font-medium ${
                                  pathname.startsWith(item.path)
                                    ? "text-brand font-semibold"
                                    : itemHover
                                }`}
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className={`mt-3 pt-3 border-t ${isHome ? "border-white/10" : "border-gray-200"} flex flex-col gap-2`}>
                {!isLoggedIn ? (
                  <Link
                    href="/login"
                    className={`flex items-center justify-center px-3 py-3 rounded-lg text-base font-semibold ${ctaBtn}`}
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
                      className={`flex items-center justify-center px-3 py-3 rounded-lg text-base font-semibold ${ctaBtn}`}
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
