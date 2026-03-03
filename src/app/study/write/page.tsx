"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import MultiSelect from "@/components/common/MultiSelect";
import Toggle from "@/components/common/Toggle";
import { studyApi } from "@/api";

const RECRUIT_STATUS_OPTIONS = [
  { label: "모집 중", value: "recruiting" },
  { label: "모집 완료", value: "completed" },
];

const STUDY_CATEGORY_CODE: Record<string, number> = {
  "C++": 1,
  Python: 2,
  Java: 3,
  알고리즘: 4,
  기타: 5,
};

export default function StudyWritePage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [recruitStatus, setRecruitStatus] = useState("recruiting");
  const [recruitCount, setRecruitCount] = useState(0);
  const [content, setContent] = useState("");

  // 상세 페이지에서 넘어온 수정 데이터 채우기
  useEffect(() => {
    const raw = sessionStorage.getItem("editPost_study");
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as {
        title?: string;
        categories?: string[];
        recruitStatus?: string;
        recruitCount?: number;
        content?: string;
      };
      if (data.title) setTitle(data.title);
      if (data.categories?.length) setCategories(data.categories);
      if (data.recruitStatus) setRecruitStatus(data.recruitStatus);
      if (typeof data.recruitCount === "number")
        setRecruitCount(data.recruitCount);
      if (data.content) setContent(data.content);
    } finally {
      sessionStorage.removeItem("editPost_study");
    }
  }, []);

  const createMutation = useMutation({
    mutationFn: async () => {
      const primaryCategory = categories[0];
      const categoryCode =
        STUDY_CATEGORY_CODE[primaryCategory as keyof typeof STUDY_CATEGORY_CODE] ??
        0;

      await studyApi.create({
        title,
        content,
        studyTags: categories,
        studyName: title,
        recruiting: recruitStatus === "recruiting",
        maxMembers: recruitCount || 5,
        category: categoryCode,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      router.push("/study");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || categories.length === 0) return;

    if (editId) {
      // TODO: 수정 API 연결 (studyApi.update)
      console.log("스터디 수정 예정", {
        editId,
        title,
        categories,
        recruitStatus,
        recruitCount,
        content,
      });
      return;
    }

    createMutation.mutate();
  };

  return (
    <main className="min-h-screen px-65 bg-gray-100">
      <div className="px-12 py-8 bg-white min-h-screen">
        <nav className="text-sm text-gray-500 mb-2">
          <Link href="/study" className="hover:text-gray-700 hover:underline">
            스터디 모집
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-900">
            {editId ? "글 수정하기" : "글 작성하기"}
          </span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {editId ? "글 수정" : "글 작성"}
        </h1>

        <div className="border-t border-gray-900 mb-6" />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            {/* 제목 */}
            <div>
              <input
                type="text"
                placeholder="제목을 입력해 주세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="
                  w-full px-4 py-3 text-base font-semibold
                  bg-gray-50 border border-gray-200 rounded-lg
                  placeholder:text-gray-400
                  transition-all duration-150
                  focus:outline-none focus:bg-gray-50 focus:border-brand focus:ring-1 focus:ring-brand focus:placeholder:text-gray-400
                "
              />
            </div>

            {/* 분류 / 모집인원 / 모집상태 (가로 한 줄) */}
            <div className="flex gap-8 items-end">
              {/* 분류: 가로 전체 사용 */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  분류
                </label>
                <MultiSelect
                  placeholder="분류 선택"
                  options={["C++", "Python", "Java", "알고리즘", "기타"]}
                  value={categories}
                  onChange={setCategories}
                />
              </div>

              {/* 모집인원 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  모집 인원
                </label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setRecruitCount((prev) => Math.max(0, prev - 1))
                    }
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
                    onClick={() =>
                      setRecruitCount((prev) => Math.max(0, prev + 1))
                    }
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  모집 상태
                </label>
                <Toggle
                  size="md"
                  options={RECRUIT_STATUS_OPTIONS}
                  value={recruitStatus}
                  onChange={setRecruitStatus}
                />
              </div>
            </div>
          </div>

          {/* 내용 */}
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
            <Link href="/study">
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
              {editId ? "수정하기" : "게시하기"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

