"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const name = useUserStore((s) => s.name);
  const clearUser = useUserStore((s) => s.clearUser);
  const isLoggedIn = !!name;

  const isBlockHeader = pathname === "/memberManage";

  const handleLogout = () => {
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
    <header className={isBlockHeader ? "" : "absolute w-full"}>
      <div className="flex bg-gray-0 items-center gap-8 px-[9.375%] py-6">
        <Link href="/" className="shrink-0">
          <img src="/assets/logo.png" alt="로고이미지" className="h-8 w-auto" />
        </Link>
        <nav className="flex flex-1 justify-center">
          <ul className="flex items-center gap-8 text-base font-medium text-gray-700">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className="transition-colors hover:text-brand"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex min-w-[120px] justify-end">
          {!isLoggedIn ? (
            <Link
              href="/login"
              className="text-base font-medium text-gray-700 transition-colors hover:text-brand"
            >
              로그인
            </Link>
          ) : (
            <div className="relative flex items-center">
              <p className="mr-2 text-sm text-[#333]">{name}님, 환영합니다!</p>
              <button
                onClick={() => setIsDropdownOpen((v) => !v)}
                className="text-sm text-gray-700"
              >
                {isDropdownOpen ? "▲" : "▼"}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full z-[999] mt-3 w-[180px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                  <Link
                    href="/change-password"
                    className="block rounded py-3 px-3.5 text-sm hover:bg-gray-100"
                  >
                    비밀번호 변경
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded py-3 px-3.5 text-left text-sm hover:bg-gray-100"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

