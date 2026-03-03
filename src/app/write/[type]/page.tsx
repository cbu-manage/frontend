"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar as CalendarIcon } from "lucide-react";
import MultiSelect from "@/components/common/MultiSelect";
import Toggle from "@/components/common/Toggle";
import { Calendar } from "@/components/common/Calendar";

const EDIT_STORAGE_KEY: Record<string, string> = {
  study: "editPost_study",
  project: "editPost_project",
};

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
  const [recruitDeadline, setRecruitDeadline] = useState<Date | undefined>();
  const [recruitCount, setRecruitCount] = useState(0);
  const [content, setContent] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  // 수정 시 상세 페이지에서 담아온 데이터로 폼 채우기
  useEffect(() => {
    const key = EDIT_STORAGE_KEY[type];
    if (!key) return;
    const raw = sessionStorage.getItem(key);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as {
        title?: string;
        categories?: string[];
        recruitStatus?: string;
        recruitDeadline?: string;
        recruitCount?: number;
        content?: string;
      };
      if (data.title) setTitle(data.title);
      if (data.categories?.length) setCategories(data.categories);
      if (data.recruitStatus) setRecruitStatus(data.recruitStatus);
      if (data.recruitDeadline) setRecruitDeadline(new Date(data.recruitDeadline));
      if (data.recruitCount) setRecruitCount(data.recruitCount);
      if (data.content) setContent(data.content);
    } finally {
      sessionStorage.removeItem(key);
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ 
      type, 
      title, 
      categories, 
      recruitStatus, 
      recruitDeadline, 
      recruitCount, 
      content 
    });
  };

  if (!config) {
    router.replace("/");
    return null;
  }

  return (
    <main className="min-h-screen px-80 bg-gray-100 min-w-[1400px]">
      <div className="px-12 py-8 bg-white min-h-screen">
        {/* 브레드크럼 */}
        <nav className="text-sm text-gray-500 mb-2">
          <Link
            href={config.backPath}
            className="hover:text-gray-700 hover:underline"
          >
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
          {/* 제목, 분류, 모집정보 - 회색 박스 */}
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
                  w-full px-4 py-3 text-base font-semibold
                  border border-gray-200 rounded-lg
                  placeholder:text-gray-400
                  transition-all duration-150
                  focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand focus:placeholder:text-gray-400
                "
                style={{ backgroundColor: "#F5F6F8" }}
              />
            </div>

            {/* 분류 */}
            <div>
              <MultiSelect
                label="분류"
                placeholder="분류를 선택해 주세요"
                options={[...config.categories]}
                value={categories}
                onChange={setCategories}
              />
            </div>

            {/* 모집마감일 | 모집인원 | 모집상태 */}
            <div className="flex gap-8 items-end">
              {/* 모집마감일 */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  모집 마감일
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="
                      w-full px-4 py-2 text-sm font-medium
                      border border-gray-200 rounded-lg
                      text-left flex items-center justify-between
                      hover:border-gray-300 transition-colors duration-150 bg-white min-h-[51px]
                    "
                  >
                    <span className={recruitDeadline ? "text-gray-900" : "text-gray-400"}>
                      {recruitDeadline 
                        ? recruitDeadline.toLocaleDateString("sv-SE")
                        : "모집 마감일을 선택해 주세요."}
                    </span>
                    <div className="p-1.5 rounded-full" style={{ backgroundColor: "#EEEFF3" }}>
                      <CalendarIcon className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  </button>
                  
                  {/* 캘린더 팝업 */}
                  {showCalendar && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                      <Calendar
                        mode="single"
                        selected={recruitDeadline}
                        onDayClick={(date) => {
                          setRecruitDeadline(date);
                          setShowCalendar(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 구분선 */}
              <div className="w-px h-12 bg-gray-100" />

              {/* 모집인원 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  모집 인원
                </label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setRecruitCount(Math.max(0, recruitCount - 1))}
                    className="
                      w-10 h-10 rounded-full text-gray-700
                      hover:opacity-80 transition-all duration-150
                      flex items-center justify-center text-xl font-medium
                    "
                    style={{ backgroundColor: "#F5F6F8" }}
                  >
                    −
                  </button>
                  <span className="text-xl font-semibold text-gray-900 w-14 text-center">
                    {String(recruitCount).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRecruitCount(recruitCount + 1)}
                    className="
                      w-10 h-10 rounded-full text-gray-700
                      hover:opacity-80 transition-all duration-150
                      flex items-center justify-center text-xl font-medium
                    "
                    style={{ backgroundColor: "#F5F6F8" }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 구분선 */}
              <div className="w-px h-12 bg-gray-100" />

              {/* 모집상태 토글 */}
              <div>
                <Toggle
                  label="모집상태"
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
                focus:outline-none focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand
              "
            />
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end gap-3">
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
