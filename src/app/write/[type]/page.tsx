"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MultiSelect from "@/components/common/MultiSelect";
import Toggle from "@/components/common/Toggle";

const WRITE_CONFIG = {
  project: {
    title: "프로젝트 모집",
    backPath: "/project",
    categories: ["프론트엔드", "백엔드", "개발", "디자인", "기획", "기타"],
  },
  study: {
    title: "스터디 모집",
    backPath: "/study",
    categories: ["C++", "Python", "Java", "알고리즘", "기타"],
  },
} as const;

type WriteType = keyof typeof WRITE_CONFIG;

const RECRUIT_STATUS_OPTIONS = [
  { label: "모집 중", value: "recruiting" },
  { label: "모집 완료", value: "completed" },
];

export default function WritePage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;
  const config = WRITE_CONFIG[type as WriteType];

  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [recruitStatus, setRecruitStatus] = useState("recruiting");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ type, title, categories, recruitStatus, content });
  };

  if (!config) {
    router.replace("/");
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-[1600px] mx-auto px-6 py-8 bg-white min-h-screen">
        {/* 브레드크럼 */}
        <nav className="text-sm text-gray-500 mb-2">
          <Link href={config.backPath} className="hover:text-gray-700 hover:underline">
            {config.title}
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
          {/* 제목, 분류, 모집상태 - 회색 박스 */}
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

            {/* 분류 & 모집상태 */}
            <div className="flex gap-4 items-end">
              {/* 분류 멀티셀렉트 */}
              <div className="flex-1">
                <MultiSelect
                  label="분류"
                  placeholder="분류를 선택해 주세요"
                  options={[...config.categories]}
                  value={categories}
                  onChange={setCategories}
                />
              </div>

              {/* 모집상태 토글 */}
              <div>
                <Toggle
                  label="모집 상태"
                  options={RECRUIT_STATUS_OPTIONS}
                  value={recruitStatus}
                  onChange={setRecruitStatus}
                />
              </div>
            </div>
          </div>

          {/* 내용 입력 */}
          <div>
            <textarea
              placeholder="내용을 입력해 주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={22}
              className="
                w-full px-4 py-3 text-base
                bg-white border border-gray-200 rounded-lg
                placeholder:text-gray-400
                transition-all duration-150 resize-none
                hover:bg-gray-100
                focus:outline-none focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand
              "
            />
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end gap-3 pt-2">
            <Link href={config.backPath}>
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
