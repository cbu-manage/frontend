"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MultiSelect from "@/components/common/MultiSelect";
import Toggle from "@/components/common/Toggle";
import Image from "next/image";
import MarkdownEditor from "@/components/coding-test/MarkdownEditor";

const SOLVE_STATUS_OPTIONS = [
  { label: "미해결", value: "unsolved" },
  { label: "해결", value: "solved" },
];

const LANGUAGE_OPTIONS = ["C", "Java", "Python", "JavaScript", "C++"] as const;
const KEYWORD_OPTIONS = ["dp", "dfs", "bfs", "구현", "그리디", "정렬"] as const;

function detectPlatform(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;

    if (host.includes("programmers.co.kr")) return "프로그래머스";
    if (host.includes("acmicpc.net")) return "백준";
    if (host.includes("leetcode.com")) return "LeetCode";

    return null;
  } catch {
    return null;
  }
}

export default function WritePage() {
  const params = useParams();
  const type = params.type as string;

  const [title, setTitle] = useState("");
  const [problemUrl, setProblemUrl] = useState("");
  const [platform, setPlatform] = useState<string | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [solveStatus, setSolveStatus] = useState("unsolved");
  const [content, setContent] = useState("");

  const handleChangeUrl = (value: string) => {
    setProblemUrl(value);
    const detected = detectPlatform(value);
    setPlatform(detected);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      type,
      title,
      problemUrl,
      platform,
      languages,
      categories,
      solveStatus,
      content,
    });
  };

  return (
    <main className="min-h-screen px-80 bg-gray-100">
      <div className="px-12 py-8 bg-white min-h-screen">
        {/* 브레드크럼 */}
        <nav className="text-sm text-gray-500 mb-2">
          <Link
            href="/coding-test"
            className="hover:text-gray-700 hover:underline"
          >
            코딩테스트 준비
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-900">글 작성하기</span>
        </nav>

        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">글 작성</h1>

        {/* 구분선 */}
        <div className="border-t border-gray-900 mb-6" />

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 제목, 문제 링크, 분류/해결 상태 - 회색 박스 */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            {/* 제목 입력 */}
            <div>
              <input
                type="text"
                placeholder="제목을 입력해 주세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="
                  w-full px-4 py-3 text-base
                  bg-gray-50 border border-gray-200 rounded-lg
                  placeholder:text-gray-400
                  transition-all duration-150
                  focus:outline-none focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand
                "
              />
            </div>

            {/* 문제 링크 + 플랫폼 자동 인식 + 내가 사용한 언어 */}
            <div className="space-y-4">
              <p className="text-base font-medium text-gray-900">문제 링크</p>

              {/* 링크 입력 영역 (연한 회색 배경, pill 형태) */}
              <div className="w-full rounded-[86px] bg-[#F5F6F8] px-5 py-2.5 flex items-center gap-3">
                {/* 동그란 아이콘 */}
                <div className="w-8 h-8 rounded-full bg-white border border-[#EEEFF3] shrink-0 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/assets/attachment.svg"
                    alt="문제 링크 아이콘"
                    width={18}
                    height={18}
                  />
                </div>

                {/* URL 입력 */}
                <input
                  type="url"
                  placeholder="문제 URL을 입력해 주세요."
                  value={problemUrl}
                  onChange={(e) => handleChangeUrl(e.target.value)}
                  className="
                    flex-1 bg-transparent border-none outline-none
                    text-base text-[#3E434A]
                    placeholder:text-gray-400
                  "
                />
              </div>

              {/* 자동 인식된 플랫폼 + 내가 사용한 언어 (같은 행) */}
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                {/* 자동 인식된 플랫폼 표시 영역 */}
                <div className="space-y-3 flex-1">
                  <p className="text-base font-medium text-gray-900">
                    문제 플랫폼 자동 인식
                  </p>

                  <div className="w-full rounded-lg bg-white border border-gray-300 px-4.5 py-2.5">
                    {platform ? (
                      <p className="text-base font-bold text-[#95C674]">
                        {platform}
                      </p>
                    ) : (
                      <p className="text-base text-gray-400">
                        링크를 입력하면 플랫폼이 자동으로 표시됩니다.
                      </p>
                    )}
                  </div>
                </div>

                {/* 내가 사용한 언어 선택 (MultiSelect) */}
                <div className="space-y-3 flex-1 mt-1">
                  <MultiSelect
                    label="내가 사용한 언어"
                    placeholder="내가 사용한 언어를 선택해 주세요"
                    value={languages}
                    onChange={setLanguages}
                    options={[...LANGUAGE_OPTIONS]}
                  />
                </div>
              </div>
            </div>

            {/* 분류 & 해결 상태 */}
            <div className="flex gap-4 items-end">
              {/* 문제 키워드 멀티셀렉트 */}
              <div className="flex-1">
                <MultiSelect
                  label="문제 키워드"
                  placeholder="문제 키워드를 선택해 주세요"
                  value={categories}
                  onChange={setCategories}
                  options={[...KEYWORD_OPTIONS]}
                />
              </div>

              {/* 해결 상태 토글 */}
              <div>
                <Toggle
                  label="해결 상태"
                  options={SOLVE_STATUS_OPTIONS}
                  value={solveStatus}
                  onChange={setSolveStatus}
                />
              </div>
            </div>
          </div>

          {/* 내용 입력 - 마크다운 에디터 */}
          <div>
            <MarkdownEditor value={content} onChange={setContent} />
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end gap-3 mb-12">
            <Link href="/coding-test">
              <button
                type="button"
                className="
                  px-6 py-2.5 text-sm font-medium
                  text-gray-600 bg-white border border-gray-300 rounded-full
                  hover:bg-gray-50 transition-colors duration-150
                "
              >
                취소
              </button>
            </Link>
            <button
              type="submit"
              className="
                px-6 py-2.5 text-sm font-medium
                text-white bg-gray-800 rounded-full
                hover:bg-gray-900 transition-colors duration-150
              "
            >
              게시하기
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
