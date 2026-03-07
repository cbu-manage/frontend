"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Calendar as CalendarIcon } from "lucide-react";
import MultiSelect from "@/components/common/MultiSelect";
import Toggle from "@/components/common/Toggle";
import { Calendar } from "@/components/ui/calendar";
import { projectApi } from "@/api";

const RECRUIT_STATUS_OPTIONS = [
  { label: "모집 중", value: "recruiting" },
  { label: "모집 완료", value: "completed" },
];

const PROJECT_CATEGORIES = [
  "프론트엔드",
  "백엔드",
  "개발",
  "디자인",
  "기획",
  "기타",
];

/** 프로젝트 포지션 한글 → API enum 매핑 (category 2 고정) */
const POSITION_TO_ENUM: Record<string, string> = {
  백엔드: "BACKEND",
  프론트엔드: "FRONTEND",
  개발: "DEV",
  기획: "PLANNING",
  디자인: "DESIGN",
  기타: "ETC",
};
/** API enum → 한글 (수정 시 폼 채우기용) */
const ENUM_TO_LABEL: Record<string, string> = {
  BACKEND: "백엔드",
  FRONTEND: "프론트엔드",
  DEV: "개발",
  PLANNING: "기획",
  DESIGN: "디자인",
  ETC: "기타",
};
const PROJECT_CATEGORY = 2;

export default function ProjectWriteClient() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [recruitStatus, setRecruitStatus] = useState("recruiting");
  const [recruitDeadline, setRecruitDeadline] = useState<Date | undefined>();
  const [recruitCount, setRecruitCount] = useState(0);
  const [content, setContent] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const numericEditId = editId ? Number(editId) : NaN;
  const isValidEditId = !!editId && !Number.isNaN(numericEditId);

  const { data: editRes } = useQuery({
    queryKey: ["project", numericEditId],
    queryFn: () => projectApi.getById(numericEditId),
    enabled: isValidEditId,
  });

  const editData = editRes?.data;
  const editPayload =
    editData && typeof editData === "object" && "data" in editData
      ? (editData as { data?: unknown }).data
      : editData;

  useEffect(() => {
    if (!isValidEditId || !editPayload || typeof editPayload !== "object") return;
    const d = editPayload as {
      title?: string;
      content?: string;
      recruitmentFields?: string[];
      recruiting?: boolean;
      deadline?: string;
      maxMember?: number;
    };
    queueMicrotask(() => {
      if (d.title) setTitle(d.title);
      if (d.content) setContent(d.content);
      if (d.recruitmentFields?.length) {
        setCategories(
          d.recruitmentFields.map((e) => ENUM_TO_LABEL[e] ?? e)
        );
      }
      if (typeof d.recruiting === "boolean")
        setRecruitStatus(d.recruiting ? "recruiting" : "completed");
      if (d.deadline) setRecruitDeadline(new Date(d.deadline));
      if (typeof d.maxMember === "number") setRecruitCount(d.maxMember);
    });
  }, [isValidEditId, editPayload]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const recruitmentFields = categories.map(
        (c) => POSITION_TO_ENUM[c] ?? c
      );
      const deadline =
        recruitDeadline?.toISOString().slice(0, 10) ?? new Date().toISOString().slice(0, 10);
      await projectApi.create({
        title,
        content,
        recruitmentFields,
        recruiting: recruitStatus === "recruiting",
        deadline,
        maxMember: Math.max(1, recruitCount),
        category: PROJECT_CATEGORY,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push("/project");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!numericEditId) return;
      const recruitmentFields = categories.map(
        (c) => POSITION_TO_ENUM[c] ?? c
      );
      const deadline =
        recruitDeadline?.toISOString().slice(0, 10) ?? undefined;
      await projectApi.update(numericEditId, {
        title,
        content,
        recruitmentFields,
        recruiting: recruitStatus === "recruiting",
        deadline,
        maxMember: Math.max(0, recruitCount),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", numericEditId] });
      router.push(`/project/${numericEditId}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || categories.length === 0) return;

    if (editId && isValidEditId) {
      updateMutation.mutate();
      return;
    }

    createMutation.mutate();
  };

  return (
    <main className="min-h-screen px-65 bg-gray-100">
      <div className="px-12 py-8 bg-white min-h-screen">
        <nav className="text-sm text-gray-500 mb-2">
          <Link href="/project" className="hover:text-gray-700 hover:underline">
            프로젝트 모집
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

            {/* 분류 / 모집정보 */}
            <div className="space-y-4">
              {/* 분류 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  모집 분야
                </label>
                <MultiSelect
                  placeholder="모집 분야를 선택해 주세요"
                  options={PROJECT_CATEGORIES}
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
                        w-full px-4 py-2 text-base font-medium
                        border border-gray-200 rounded-lg
                        text-left flex items-center justify-between
                        hover:border-gray-300 transition-colors duration-150 bg-white min-h-[51px]
                      "
                    >
                      <span
                        className={
                          recruitDeadline ? "text-gray-900" : "text-gray-400"
                        }
                      >
                        {recruitDeadline
                          ? recruitDeadline.toLocaleDateString("sv-SE")
                          : "모집 마감일을 선택해 주세요."}
                      </span>
                      <div
                        className="p-1.5 rounded-full"
                        style={{ backgroundColor: "#EEEFF3" }}
                      >
                        <CalendarIcon className="w-5 h-5 stroke-[1.5]" />
                      </div>
                    </button>

                    {/* 캘린더 팝업 (아이콘 바로 아래) */}
                    {showCalendar && (
                      <div className="absolute top-full right-0 mt-2 z-10">
                        <div className="mx-auto w-fit rounded-lg border bg-white shadow-lg p-0">
                          <Calendar
                            mode="single"
                            defaultMonth={recruitDeadline ?? new Date()}
                            selected={recruitDeadline}
                            onSelect={(date) => {
                              setRecruitDeadline(date ?? undefined);
                              setShowCalendar(false);
                            }}
                            showWeekNumber
                            className="p-3 border-0"
                          />
                        </div>
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
                  <Toggle
                    label="모집상태"
                    options={RECRUIT_STATUS_OPTIONS}
                    value={recruitStatus}
                    onChange={setRecruitStatus}
                  />
                </div>
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
            <Link href="/project">
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
