"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export default function Header() {
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
    <header
      className={isBlockHeader ? "border-b border-gray-200" : "sticky top-0 w-full z-40 bg-gray-0 border-b border-gray-200"}
    >
      <div className="flex bg-gray-0 items-center gap-8 px-[9.375%] py-6">
        <Link href="/" className="shrink-0">
          <img src="/assets/logo.png" alt="로고이미지" className="h-8 w-auto" />
        </Link>
        <nav className="hidden md:flex flex-1 justify-center">
          <ul className="flex items-center gap-8 text-base font-medium text-gray-700">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`transition-colors hover:text-brand ${
                    pathname.startsWith(item.path)
                      ? "text-brand font-semibold"
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
              className="flex items-center justify-center px-3 py-1.5 gap-[7px] rounded-lg bg-brand text-white text-base font-semibold leading-[140%] tracking-[-0.06px] transition-colors hover:opacity-90"
            >
              로그인
            </Link>
          ) : (
            <>
              <Link
                href="/user"
                className={`transition-colors hover:text-brand ${
                  pathname.startsWith("/user") ?  "text-brand font-semibold" : "text-gray-700 font-medium"
                }`}
              >
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center px-3 py-1.5 gap-[7px] rounded-lg bg-brand text-white text-base font-semibold leading-[140%] tracking-[-0.06px] transition-colors hover:opacity-90"
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
