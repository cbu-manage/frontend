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

  const utilItems = [
    { name: "로그인", path: "/login" },
    { name: "회원가입", path: "/join" },
  ];

  return (
    <header className={isBlockHeader ? "" : "absolute w-full"}>
      <div className="flex items-center justify-between px-[9.375%] py-6">
        <Link href="/">
          <img src="/assets/logo.png" alt="로고이미지" className="h-8 w-auto" />
        </Link>
        <div>
          {!isLoggedIn ? (
            <ul className="flex gap-6">
              {utilItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path} className="block text-base text-[#333]">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="relative flex items-center">
              <p className="text-sm text-[#333] mr-2">{name}님, 환영합니다!</p>
              <button
                onClick={() => setIsDropdownOpen((v) => !v)}
                className="text-sm text-[#333]"
              >
                {isDropdownOpen ? "▲" : "▼"}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-[180px] bg-white border border-zinc-200 rounded-lg shadow-lg p-3 z-[999]">
                  <Link
                    href="/change-password"
                    className="block text-sm py-3 px-3.5 hover:bg-zinc-50 rounded"
                  >
                    비밀번호 변경
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-sm py-3 px-3.5 hover:bg-zinc-50 rounded"
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

