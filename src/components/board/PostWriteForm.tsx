"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import FileUploadBox from "@/components/shared/FileUploadBox";
import { useIsStaff } from "@/hooks/auth/useIsStaff";

type PostWriteSubmitData = {
  title: string;
  content: string;
  category: string | null;
  isAnonymous: boolean;
};

type PostWriteFormProps = {
  /** breadcrumb 게시판명 */
  boardName: string;
  /** 페이지 제목 */
  heading: string;
  /** 제목 아래 안내문 (선택) */
  subtitle?: string;
  /** 분류(카테고리) 옵션 — 게시판마다 다름 */
  categories: string[];
  /** 익명 작성 체크박스 노출 (자유게시판만) */
  showAnonymous?: boolean;
  /** 운영진만 작성 가능 (공지·뉴스레터). 일반 회원은 권한 없음 안내 */
  staffOnly?: boolean;
  /** 취소/게시 후 이동 경로 (목록) */
  backPath: string;
  contentPlaceholder?: string;
  /** 본문 기본 글자수 제한 (기본 10000) */
  contentMaxLength?: number;
  /** 카테고리별 글자수 제한 오버라이드 (예: { 공지: 20000 }) — 없으면 contentMaxLength 사용 */
  categoryMaxLength?: Record<string, number>;
  /** 수정 모드 초기값 */
  initialValues?: {
    title: string;
    content: string;
    category?: string;
    isAnonymous?: boolean;
  };
  /** 게시 버튼 클릭 시 호출 — 미전달 시 backPath로 이동만 */
  onSubmit?: (data: PostWriteSubmitData) => Promise<void>;
  isSubmitting?: boolean;
};

/**
 * 게시판 글 작성 공용 폼 — 제목+분류 / 본문 / 파일첨부 / 하단 액션.
 * (Figma: 공지사항 작성·자유게시판 글 작성) 게시판별 차이는 props로.
 */
export default function PostWriteForm({
  boardName,
  heading,
  subtitle,
  categories,
  showAnonymous = false,
  staffOnly = false,
  backPath,
  contentPlaceholder = "내용을 입력해 주세요.",
  contentMaxLength = 10000,
  categoryMaxLength,
  initialValues,
  onSubmit,
  isSubmitting = false,
}: PostWriteFormProps) {
  const router = useRouter();
  const isStaff = useIsStaff();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [category, setCategory] = useState<string | null>(
    initialValues?.category ?? null,
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [anonymous, setAnonymous] = useState(
    initialValues?.isAnonymous ?? true,
  );
  const [files, setFiles] = useState<File[]>([]);
  const maxLen =
    (category ? categoryMaxLength?.[category] : undefined) ?? contentMaxLength;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialValues === undefined) return;
    setTitle(initialValues.title);
    setContent(initialValues.content);
    if (initialValues.category !== undefined)
      setCategory(initialValues.category);
    if (initialValues.isAnonymous !== undefined)
      setAnonymous(initialValues.isAnonymous);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialValues?.title,
    initialValues?.content,
    initialValues?.category,
    initialValues?.isAnonymous,
  ]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handle = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [dropdownOpen]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    if (onSubmit) {
      await onSubmit({ title, content, category, isAnonymous: anonymous });
    } else {
      router.push(backPath);
    }
  };

  if (staffOnly && !isStaff) {
    return (
      <RequireMember>
        <main className="min-h-screen bg-white">
          <div className="container-x-lg flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
            <h1 className="text-h1 text-gray-900">운영진만 작성할 수 있어요</h1>
            <p className="text-base text-gray-600">
              권한이 있는 계정으로 로그인해주세요.
            </p>
            <button
              onClick={() => router.push(backPath)}
              className="mt-2 inline-flex items-center gap-1 rounded-full border border-gray-200 px-5 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
            >
              목록으로
            </button>
          </div>
        </main>
      </RequireMember>
    );
  }

  return (
    <RequireMember>
      <main className="min-h-screen bg-white pb-16">
        <div className="container-x-lg pt-6 lg:pt-12">
          {/* breadcrumb */}
          <p className="mb-3 text-sm text-gray-400">
            {boardName} <span className="mx-1">›</span> 글 작성하기
          </p>

          {/* 제목 영역 */}
          <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          <div className="mt-4 border-b border-gray-200" />

          {/* 제목 + 분류 */}
          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-gray-200 p-4">
            <div className="flex flex-1 items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
                placeholder="제목을 입력해 주세요"
                className="flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400"
              />
              <span className="shrink-0 text-sm text-gray-400">
                {title.length} / 50
              </span>
            </div>
            <div className="relative w-52 shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm transition-colors hover:bg-gray-50"
              >
                <span className={category ? "text-gray-900" : "text-gray-400"}>
                  {category ?? "분류를 선택해 주세요"}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {dropdownOpen && (
                <ul className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  {categories.map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        onClick={() => {
                          setCategory(c);
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                          category === c
                            ? "bg-brand/5 text-brand"
                            : "text-gray-700"
                        }`}
                      >
                        {c}
                        {category === c && (
                          <Check size={15} className="text-brand" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 본문 */}
          <div className="mt-4 rounded-2xl border border-gray-200 p-5">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={maxLen}
              rows={16}
              placeholder={contentPlaceholder}
              className="w-full resize-none text-base text-gray-900 outline-none placeholder:text-gray-400"
            />
            <div className="mt-2 text-right text-sm text-gray-400">
              {content.length.toLocaleString()} / {maxLen.toLocaleString()}
            </div>
          </div>

          {/* 파일 첨부 */}
          <div className="mt-4 rounded-2xl border border-gray-200 p-5">
            <p className="mb-3 text-sm font-medium text-gray-700">
              파일 첨부{showAnonymous ? " (선택)" : ""}
            </p>
            {/* TODO(API): 게시 시 첨부파일 업로드 연동 (현재 files 상태만 보유) */}
            <FileUploadBox files={files} onChange={setFiles} multiple />
          </div>

          {/* 익명 작성 (자유게시판) — 파일첨부와 버튼 사이 별도 행 */}
          {showAnonymous && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setAnonymous((v) => !v)}
                aria-pressed={anonymous}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  anonymous
                    ? "text-gray-800"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    anonymous
                      ? "border-gray-800 bg-gray-800"
                      : "border-gray-300"
                  }`}
                >
                  {anonymous && (
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                익명으로 작성
              </button>
            </div>
          )}

          {/* 하단 액션 */}
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push(backPath)}
              className="rounded-full bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-full bg-gray-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "게시 중..." : "게시하기"}
            </button>
          </div>
        </div>
      </main>
    </RequireMember>
  );
}
