"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toggle from "@/components/common/Toggle";
import Image from "next/image";
import MarkdownEditor from "@/components/coding-test/MarkdownEditor";
import { codingTestApi } from "@/api";
import { useCodingTestMetaStore } from "@/store/codingTestMetaStore";
import { useCodingTestMeta } from "@/hooks/coding-test/useCodingTestMeta";
import { ChevronDown, Check, X } from "lucide-react";

const SOLVE_STATUS_OPTIONS = [
  { label: "미해결", value: "UNSOLVED" },
  { label: "해결", value: "SOLVED" },
];

// const GRADE_OPTIONS = [
//   "BRONZE",
//   "SILVER",
//   "GOLD",
//   "PLATINUM",
//   "DIAMOND",
// ] as const;

function detectPlatformFromUrl(url: string): string | null {
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

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string | number | null;
  onChange: (val: string) => void;
  options: { label: string; value: string | number }[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between rounded-lg bg-white border border-gray-300 px-4 py-2.5 text-base text-left hover:border-gray-400 transition-colors"
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl bg-white border border-gray-200 shadow-lg py-1">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(String(opt.value));
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  opt.value === value ? "text-brand font-semibold bg-green-50" : "text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MultiSelect({
  values,
  onChange,
  options,
  placeholder,
}: {
  values: number[];
  onChange: (vals: number[]) => void;
  options: { label: string; value: number }[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.filter((o) => values.includes(o.value));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between rounded-lg bg-white border border-gray-300 px-3 py-2 text-base text-left hover:border-gray-400 transition-colors gap-2 min-h-[42px]"
      >
        <div className="flex-1 flex flex-wrap gap-1.5">
          {selected.length > 0 ? (
            selected.map((s) => (
              <span
                key={s.value}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-[#3E434A] rounded-full text-[13px] font-medium font-['Inter']"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(values.filter((v) => v !== s.value));
                }}
              >
                {s.label}
                <X size={12} className="text-gray-400 hover:text-gray-600" />
              </span>
            ))
          ) : (
            <span className="text-gray-400 px-1">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl bg-white border border-gray-200 shadow-lg py-1">
          {options.map((opt) => {
            const checked = values.includes(opt.value);
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    if (checked) onChange(values.filter((v) => v !== opt.value));
                    else onChange([...values, opt.value]);
                  }}
                  className={`w-full flex items-center justify-between text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                    checked ? "text-brand font-semibold bg-green-50" : "text-gray-700"
                  }`}
                >
                  {opt.label}
                  {checked && <Check size={16} className="text-brand shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CodingTestWriteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const editId = searchParams.get("id");

  const [title, setTitle] = useState("");
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [problemUrl, setProblemUrl] = useState("");
  const [platformId, setPlatformId] = useState<number | null>(null);
  const [languageId, setLanguageId] = useState<number | null>(null);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [grade, setGrade] = useState<string>("SILVER");
  const [solveStatus, setSolveStatus] = useState<"SOLVED" | "UNSOLVED">(
    "UNSOLVED",
  );
  const [content, setContent] = useState("");

  useCodingTestMeta();
  const platforms = useCodingTestMetaStore((s) => s.platforms);
  const languages = useCodingTestMetaStore((s) => s.languages);
  const categories = useCodingTestMetaStore((s) => s.categories);

  const { data: detailRes } = useQuery({
    queryKey: ["codingTest", "detail", editId],
    queryFn: () => codingTestApi.getById(Number(editId)),
    enabled: !!editId && !Number.isNaN(Number(editId)),
  });

  const createMutation = useMutation({
    mutationFn: (data: import("@/api").CreateProblemRequest) =>
      codingTestApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["codingTest", "list"] });
      router.push("/coding-test");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: import("@/api").UpdateProblemRequest;
    }) => codingTestApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["codingTest", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["codingTest", "detail", editId],
      });
      if (editId) router.push(`/coding-test/${editId}`);
      else router.push("/coding-test");
    },
  });

  useEffect(() => {
    const raw = sessionStorage.getItem("editPost_codingtest");
    if (raw) {
      try {
        const data = JSON.parse(raw) as {
          title?: string;
          categories?: string[];
          categoryIds?: number[];
          platformId?: number;
          platformName?: string;
          languageId?: number;
          languageName?: string;
          grade?: string;
          solveStatus?: string;
          content?: string;
          problemUrl?: string;
        };
        if (data.title) setTitle(data.title);
        if (data.categoryIds?.length) setCategoryIds(data.categoryIds);
        else if (data.categories?.length && categories.length) {
          const ids = data.categories
            .map((name) => categories.find((c) => c.name === name)?.id)
            .filter((id): id is number => id != null);
          if (ids.length) setCategoryIds(ids);
        }
        if (data.platformId != null) setPlatformId(data.platformId);
        else if (data.platformName && platforms.length) {
          const found = platforms.find((p) => p.name === data.platformName);
          if (found) setPlatformId(found.id);
        }
        if (data.languageId != null) setLanguageId(data.languageId);
        else if (data.languageName && languages.length) {
          const found = languages.find((l) => l.name === data.languageName);
          if (found) setLanguageId(found.id);
        }
        if (data.grade) setGrade(data.grade);
        if (data.solveStatus === "solved" || data.solveStatus === "SOLVED")
          setSolveStatus("SOLVED");
        if (data.solveStatus === "unsolved" || data.solveStatus === "UNSOLVED")
          setSolveStatus("UNSOLVED");
        if (data.content) setContent(data.content);
        if (data.problemUrl) setProblemUrl(data.problemUrl);
      } finally {
        sessionStorage.removeItem("editPost_codingtest");
      }
      return;
    }
    if (detailRes?.data && editId) {
      const rawBody = detailRes.data as
        | { data?: Record<string, unknown> }
        | Record<string, unknown>;
      const d = (
        rawBody && typeof rawBody === "object" && "data" in rawBody
          ? (rawBody as { data?: Record<string, unknown> }).data
          : rawBody
      ) as Record<string, unknown> | undefined;
      if (d) {
        if (d.title) setTitle(String(d.title));
        if (d.content) setContent(String(d.content));
        if (d.problemUrl) setProblemUrl(String(d.problemUrl));
        if (d.problemStatus === "SOLVED") setSolveStatus("SOLVED");
        if (d.problemStatus === "UNSOLVED") setSolveStatus("UNSOLVED");
        if (typeof d.platformId === "number") setPlatformId(d.platformId);
        else if (typeof d.platformName === "string" && platforms.length) {
          const found = platforms.find((p) => p.name === d.platformName);
          if (found) setPlatformId(found.id);
        }
        if (typeof d.languageId === "number") setLanguageId(d.languageId);
        else if (typeof d.languageName === "string" && languages.length) {
          const found = languages.find((l) => l.name === d.languageName);
          if (found) setLanguageId(found.id);
        }
        if (Array.isArray(d.categoryIds))
          setCategoryIds(d.categoryIds as number[]);
        else if (Array.isArray(d.categories) && categories.length) {
          const ids = (d.categories as string[])
            .map((name) => categories.find((c) => c.name === name)?.id)
            .filter((cid): cid is number => cid != null);
          if (ids.length) setCategoryIds(ids);
        }
        if (d.grade && typeof d.grade === "string") setGrade(d.grade);
      }
    }
  }, [editId, detailRes?.data, categories, platforms, languages]);

  const handleChangeUrl = (value: string) => {
    setProblemUrl(value);
    const detected = detectPlatformFromUrl(value);
    if (detected && platforms.length) {
      const found = platforms.find((p) => p.name === detected);
      if (found) setPlatformId(found.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !problemUrl.trim() ||
      platformId == null ||
      languageId == null ||
      categoryIds.length === 0
    ) {
      alert("제목, 문제 링크, 플랫폼, 언어, 카테고리를 모두 입력해 주세요.");
      return;
    }
    const payload = {
      categoryIds,
      platformId,
      languageId,
      title: title.trim(),
      content: content.trim(),
      grade,
      problemUrl: problemUrl.trim(),
      problemStatus: solveStatus,
    };
    if (editId && !Number.isNaN(Number(editId))) {
      updateMutation.mutate({ id: Number(editId), data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <main className="min-h-screen px-[15%] bg-gray-100">
      <div className="px-6 py-8 bg-white min-h-screen">
        <nav className="text-sm text-gray-500 mb-2">
          <Link
            href="/coding-test"
            className="hover:text-gray-700 hover:underline"
          >
            코딩테스트 준비
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
            <div>
              <input
                type="text"
                placeholder="제목을 입력해 주세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setIsTitleFocused(true)}
                onBlur={() => setIsTitleFocused(false)}
                required
                className={`w-full px-4 py-3 text-base rounded-lg bg-gray-50 placeholder:text-gray-400 transition-all duration-150 focus:outline-none focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand ${
                  isTitleFocused || !title.trim()
                    ? "border border-gray-200"
                    : "border-0"
                }`}
              />
            </div>

            <div className="space-y-4">
              <p className="text-base font-medium text-gray-900">문제 링크</p>
              <div className="w-full rounded-[86px] bg-[#F5F6F8] px-5 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-[#EEEFF3] shrink-0 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/assets/attachment.svg"
                    alt="문제 링크"
                    width={18}
                    height={18}
                  />
                </div>
                <input
                  type="url"
                  placeholder="문제 URL을 입력해 주세요."
                  value={problemUrl}
                  onChange={(e) => handleChangeUrl(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-base text-[#3E434A] placeholder:text-gray-400"
                />
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="space-y-3 flex-1">
                  <p className="text-base font-medium text-gray-900">플랫폼</p>
                  <div className="w-full rounded-lg bg-[#F5F6F8] border border-gray-200 px-4 py-2.5 text-base min-h-[42px] flex items-center">
                    {platformId != null ? (
                      <span className="text-gray-900">
                        {platforms.find((p) => p.id === platformId)?.name ?? "인식됨"}
                      </span>
                    ) : (
                      <span className="text-gray-400">URL을 입력하면 자동 인식됩니다</span>
                    )}
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  <p className="text-base font-medium text-gray-900">언어</p>
                  <CustomSelect
                    value={languageId}
                    onChange={(v) => setLanguageId(Number(v))}
                    options={languages.map((l) => ({ label: l.name ?? `ID ${l.id}`, value: l.id }))}
                    placeholder="언어 선택"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="space-y-3 flex-1">
                  <p className="text-base font-medium text-gray-900">카테고리</p>
                  <MultiSelect
                    values={categoryIds}
                    onChange={setCategoryIds}
                    options={categories.map((c) => ({ label: c.name ?? `ID ${c.id}`, value: c.id }))}
                    placeholder="카테고리 선택 (복수 가능)"
                  />
                </div>
                <div className="shrink-0">
                  <Toggle
                    label="해결 상태"
                    options={SOLVE_STATUS_OPTIONS}
                    value={solveStatus}
                    onChange={(v) => setSolveStatus(v as "SOLVED" | "UNSOLVED")}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <MarkdownEditor value={content} onChange={setContent} />
          </div>

          <div className="flex justify-end gap-3 mb-12">
            <Link href="/coding-test">
              <button
                type="button"
                className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
              >
                취소
              </button>
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gray-800 rounded-full hover:bg-gray-900 disabled:opacity-50"
            >
              {editId ? "수정하기" : "게시하기"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function CodingTestWritePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen px-[9.375%] bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">로딩 중...</p>
        </main>
      }
    >
      <CodingTestWriteContent />
    </Suspense>
  );
}
