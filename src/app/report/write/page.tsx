"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";

// TODO: API 연동 후 교체 (GET /api/v1/my/studies)
const MOCK_STUDIES = [
  { id: 1, name: "알고리즘 스터디" },
  { id: 2, name: "React 스터디" },
  { id: 3, name: "백엔드 프로젝트" },
];

// TODO: API 연동 후 교체 (GET /api/v1/study/{id}/members)
const MOCK_PARTICIPANTS: Record<number, string[]> = {
  1: ["15기 김민주", "15기 나도현", "15기 정재준", "14기 이서연"],
  2: ["15기 김민주", "14기 공도식", "14기 최준호"],
  3: ["14기 이서연", "14기 최준호", "15기 정재준"],
};

export default function ReportUploadPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [studyId, setStudyId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [activity, setActivity] = useState("");
  const [reflection, setReflection] = useState("");
  const [nextPlan, setNextPlan] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const participants = studyId ? (MOCK_PARTICIPANTS[studyId] ?? []) : [];

  const toggleParticipant = (name: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const handleStudyChange = (id: number) => {
    setStudyId(id);
    setSelectedParticipants([]);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 border-0 no-underline">새 보고서 업로드</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gray-800 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              저장
            </button>
          </div>
        </div>

        <div className="space-y-6">

          {/* 제목 + 스터디/프로젝트 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">보고서 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 2026년 4월 정기활동 보고서"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
            <div className="space-y-1.5" ref={dropdownRef}>
              <label className="text-sm font-medium text-gray-700">스터디/프로젝트 명</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
                >
                  <span className={studyId ? "text-gray-700" : "text-gray-400"}>
                    {studyId ? MOCK_STUDIES.find((s) => s.id === studyId)?.name : "선택 가능 (본인이 속한 스터디)"}
                  </span>
                  <ChevronDown size={15} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {dropdownOpen && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
                    {MOCK_STUDIES.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => { handleStudyChange(s.id); setDropdownOpen(false); }}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {s.name}
                          {studyId === s.id && <Check size={13} className="text-gray-700" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* 시작일 + 작성자 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5" ref={calendarRef}>
              <label className="text-sm font-medium text-gray-700">시작일</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCalendarOpen((v) => !v)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
                >
                  <span className={startDate ? "text-gray-700" : "text-gray-400"}>
                    {startDate ? format(startDate, "yyyy년 M월 d일", { locale: ko }) : "날짜를 선택하세요"}
                  </span>
                  <CalendarIcon size={15} className="text-gray-400" />
                </button>
                {calendarOpen && (
                  <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-md">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => { setStartDate(date); setCalendarOpen(false); }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">작성자 (자동)</label>
              <input
                type="text"
                value="15기 김민주"
                readOnly
                autoComplete="off"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          {/* 파일 업로드 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">파일 업로드</label>
            <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3">
              <label className="shrink-0 cursor-pointer px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                사진
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const selected = Array.from(e.target.files ?? []).map((f) => ({
                      name: f.name,
                      size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
                    }));
                    setFiles((prev) => [...prev, ...selected]);
                    e.target.value = "";
                  }}
                />
              </label>
              <span className="flex-1 text-sm text-gray-400">
                {files.length === 0 ? "파일을 선택하세요" : `${files.length}개 파일 선택됨`}
              </span>
            </div>
            {files.length > 0 && (
              <ul className="space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="truncate">{f.name}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-xs text-gray-400">{f.size}</span>
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        × 제거
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">파싱 미리보기</span>
              <button type="button" className="px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                자동 추출
              </button>
            </div>
          </div>

          {/* 활동 내용 + 참여자 명단 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">활동 내용</label>
              <textarea
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                rows={5}
                placeholder="활동 내용을 입력하세요"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">참여자 명단</label>
              <div className="w-full border border-gray-200 rounded-lg px-3 py-2 min-h-[120px]">
                {participants.length === 0 ? (
                  <p className="text-sm text-gray-400">스터디/프로젝트를 먼저 선택하세요</p>
                ) : (
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {participants.map((name) => {
                      const checked = selectedParticipants.includes(name);
                      return (
                        <label key={name} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                          <span
                            onClick={() => toggleParticipant(name)}
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              checked ? "bg-gray-800 border-gray-800" : "bg-white border-gray-300"
                            }`}
                          >
                            {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                          </span>
                          {name}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 스터디 후 느낀 점 + 다음 주 계획 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">스터디 후 느낀 점</label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={4}
                placeholder="스터디 후 느낀 점을 입력하세요"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">다음 주 계획</label>
              <textarea
                value={nextPlan}
                onChange={(e) => setNextPlan(e.target.value)}
                rows={4}
                placeholder="다음 주 계획을 입력하세요"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
              />
            </div>
          </div>

        </div>

        {/* 하단 버튼 
        <div className="flex justify-end gap-2 mt-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-gray-800 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            저장
          </button>
        </div>*/}

      </div>
    </main>
  );
}
