"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Paperclip, Monitor } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import { useIsStaff } from "@/hooks/auth/useIsStaff";
import Mascot from "@/components/common/Mascot";

const CATEGORIES = ["모임", "MT", "회식", "박람회", "행사"];

export default function MeetingWritePage() {
  const router = useRouter();
  const isStaff = useIsStaff();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [datetime, setDatetime] = useState("");
  const [location, setLocation] = useState("");
  const [done, setDone] = useState(false); // false=모집 중, true=모집 완료
  const [content, setContent] = useState("");

  // 운영진만 모임 등록 가능
  if (!isStaff) {
    return (
      <RequireMember>
        <main className="container-x-lg flex min-h-[60vh] flex-col items-center justify-center text-center">
          <Mascot emotion="sad" size="md" />
          <h1 className="mt-6 text-xl font-bold text-gray-900">운영진만 등록할 수 있어요</h1>
          <p className="mt-2 text-sm text-gray-500">모임 일정은 운영진이 등록합니다.</p>
          <button
            onClick={() => router.push("/meeting")}
            className="mt-6 rounded-full border border-gray-200 px-6 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            목록으로
          </button>
        </main>
      </RequireMember>
    );
  }

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg pt-6 lg:pt-12">
          {/* 헤더 */}
          <nav className="text-sm text-gray-400">
            <button onClick={() => router.push("/meeting")} className="hover:text-gray-600">
              모임
            </button>
            <span className="mx-1.5">›</span>
            <span className="text-gray-600">새 모임 등록</span>
          </nav>
          <div className="mt-2 flex items-end justify-between border-b border-gray-900 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">새 모임 등록</h1>
              <p className="mt-1 text-sm text-gray-400">
                운영진만 등록 가능 · 등록 시 전 회원에게 알림
              </p>
            </div>
          </div>

          {/* 모임 정보 카드 */}
          <div className="mt-6 rounded-2xl border border-gray-200 p-6">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              placeholder="모임명을 입력하세요 (예: 2026 봄학기 신입 환영회)"
              className="w-full rounded-xl bg-gray-50 px-5 py-4 text-base text-gray-900 placeholder-gray-400 focus:outline-none"
            />

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* 카테고리 */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">카테고리</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none ${
                      category ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    <option value="" disabled>
                      카테고리를 선택해주세요
                    </option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="text-gray-900">
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              {/* 일시 */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">일시</label>
                <input
                  type="datetime-local"
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                />
              </div>

              {/* 장소 */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">장소</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="장소를 입력해 주세요."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>

              {/* 모집 상태 */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">모집 상태</label>
                <div className="inline-flex rounded-full bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setDone(false)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                      !done ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                    }`}
                  >
                    모집 중
                  </button>
                  <button
                    type="button"
                    onClick={() => setDone(true)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                      done ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                    }`}
                  >
                    모집 완료
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div className="mt-6 rounded-2xl border border-gray-200 p-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={10000}
              rows={14}
              placeholder="모임 설명, 장소 상세, 회비, 준비물 등을 자유롭게 입력하세요…"
              className="w-full resize-none text-sm leading-relaxed text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            <div className="mt-2 text-right text-xs text-gray-400">{content.length} / 10,000</div>
          </div>

          {/* 파일 첨부 */}
          <div className="mt-6 rounded-2xl border border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-900">파일 첨부 (선택)</p>
            <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 px-5 py-4 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Paperclip size={16} />
                버튼 선택 또는 첨부파일을 이곳에 드래그&드롭해 주세요.
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-600">
                <Monitor size={14} /> 내 컴퓨터 찾기
              </span>
              <input type="file" multiple className="hidden" />
            </label>
          </div>

          {/* 푸터 */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/meeting")}
              className="rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => router.push("/meeting")}
              className="rounded-full bg-gray-800 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
            >
              게시하기
            </button>
          </div>
        </div>
      </main>
    </RequireMember>
  );
}
