"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import RequireAdmin from "@/components/auth/RequireAdmin";

const NEWS_CATEGORIES = ["월간", "주간", "공지", "특집"];

export default function NewsWritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("월간");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    // TODO: API 연동 (POST /api/v1/news?category=월간)
    router.push("/news");
  };

  return (
    <RequireAdmin>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-16">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-h1 text-gray-900">새 뉴스레터 작성</h1>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">취소</button>
                <button type="submit" form="news-form" className="px-4 py-2 bg-gray-800 rounded-lg text-sm text-white hover:bg-gray-700 transition-colors">게시</button>
              </div>
            </div>

            <form id="news-form" onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* 제목 */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="뉴스레터 제목을 입력하세요"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>

              {/* 카테고리 */}
              <div>
                <div className="w-full max-w-xs" ref={dropdownRef}>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">카테고리</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen((v) => !v)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
                    >
                      <span className="text-gray-700">{category}</span>
                      <ChevronDown size={15} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {dropdownOpen && (
                      <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
                        {NEWS_CATEGORIES.map((c) => (
                          <li key={c}>
                            <button
                              type="button"
                              onClick={() => { setCategory(c); setDropdownOpen(false); }}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              {c}
                              {category === c && <Check size={13} className="text-gray-700" />}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* 본문 */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">본문</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* 툴바 (UI 전용) */}
                  <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50 text-sm text-gray-500 flex-wrap">
                    {["B", "I", "U"].map((t) => <button key={t} type="button" className="px-1.5 py-0.5 hover:bg-gray-200 rounded font-medium">{t}</button>)}
                    <span className="text-gray-200 mx-1">|</span>
                    {["H1", "H2"].map((t) => <button key={t} type="button" className="px-1.5 py-0.5 hover:bg-gray-200 rounded text-xs font-medium">{t}</button>)}
                    <span className="text-gray-200 mx-1">|</span>
                    <button type="button" className="px-1.5 py-0.5 hover:bg-gray-200 rounded">• 목록</button>
                    <button type="button" className="px-1.5 py-0.5 hover:bg-gray-200 rounded">1 번호</button>
                    <span className="text-gray-200 mx-1">|</span>
                    <button type="button" className="px-1.5 py-0.5 hover:bg-gray-200 rounded text-xs">{`</>`}</button>
                    <button type="button" className="px-1.5 py-0.5 hover:bg-gray-200 rounded text-xs">🖼</button>
                    <button type="button" className="px-1.5 py-0.5 hover:bg-gray-200 rounded text-xs">—</button>
                    <button type="button" className="px-1.5 py-0.5 hover:bg-gray-200 rounded text-xs">표</button>
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="내용을 입력하세요..."
                    required
                    rows={16}
                    className="w-full px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* 파일 첨부 */}
              <div>
                <label className="text-sm text-gray-500 cursor-pointer flex items-center gap-1.5 w-fit">
                  <span>🔗</span>
                  <span>파일 첨부 (선택)</span>
                  <input type="file" multiple className="hidden" />
                </label>
              </div>
            </form>
          </div>
        </div>
      </main>
    </RequireAdmin>
  );
}
