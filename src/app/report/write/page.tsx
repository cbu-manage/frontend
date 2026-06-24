"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Check, CalendarIcon, Monitor, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { groupApi, reportApi, type MyGroupItem } from "@/api";
import { useUserStore } from "@/store/userStore";

export default function ReportUploadPage() {
  return (
    <Suspense fallback={null}>
      <ReportUploadContent />
    </Suspense>
  );
}

function ReportUploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = editId !== null;
  const userName = useUserStore((s) => s.name);

  const [title, setTitle] = useState("");
  const [groupId, setGroupId] = useState<number | null>(null);
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

  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [activity, setActivity] = useState("");
  const [reflection, setReflection] = useState("");
  const [nextPlan, setNextPlan] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  // 수정 모드에서 기존 첨부(활동 사진/파일) URL 보존 — 서버 필수값이라 그대로 재전송
  const [reportImage, setReportImage] = useState<string | null>(null);
  const [reportFile, setReportFile] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 내가 속한 그룹 목록 (드롭다운)
  const { data: groupsRes } = useQuery({
    queryKey: ["myGroups"],
    queryFn: () => groupApi.getMyGroups(),
  });
  const groups: MyGroupItem[] = groupsRes?.data?.data ?? [];

  // 선택한 그룹의 멤버 (참여자 체크박스)
  const { data: groupDetailRes } = useQuery({
    queryKey: ["groupDetail", groupId],
    queryFn: () => groupApi.getById(groupId as number),
    enabled: groupId != null,
  });
  const members = (groupDetailRes?.data?.data?.members ?? []).filter(
    (m) => m.groupMemberStatus === "ACTIVE",
  );

  // 수정 모드: 기존 보고서 불러와 폼 채우기
  const { data: editRes } = useQuery({
    queryKey: ["report", editId],
    queryFn: () => reportApi.getById(Number(editId)),
    enabled: isEdit,
  });

  const prefilledRef = useRef(false);
  useEffect(() => {
    const detail = editRes?.data?.data;
    if (!detail || prefilledRef.current) return;
    prefilledRef.current = true;
    const { postInfoDTO: post, reportInfoDTO: report } = detail;
    setTitle(post.title ?? "");
    setActivity(post.content ?? "");
    setReflection(report.reflection ?? "");
    setNextPlan(report.nextPlan ?? "");
    setLocation(report.location ?? "");
    setStartDate(report.date ? new Date(report.date) : undefined);
    setGroupId(report.groupInfoDTO.groupId);
    setSelectedMemberIds(report.reportMembers.map((m) => m.userId));
    setReportImage(report.reportImage ?? null);
    setReportFile(report.reportFile ?? null);
  }, [editRes]);

  const toggleMember = (userId: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleGroupChange = (id: number) => {
    setGroupId(id);
    setSelectedMemberIds([]);
  };

  // 사진 1장만 — 새로 고르면 교체. 제출 시 S3 업로드 후 URL을 reportImage로 전송.
  const pickPhoto = (f?: File | null) => {
    if (!f) return;
    setPhotoFile(f);
    setFiles([{ name: f.name, size: (f.size / (1024 * 1024)).toFixed(1) + " MB" }]);
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setFiles([]);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("보고서 제목을 입력하세요.");
      return;
    }
    if (groupId == null) {
      alert("스터디/프로젝트를 선택하세요.");
      return;
    }
    if (!startDate) {
      alert("활동 일자를 선택하세요.");
      return;
    }
    // reportImage는 서버 필수값 — 신규 작성은 사진 첨부 필수 (수정은 기존 이미지 유지 가능)
    if (!isEdit && !photoFile) {
      alert("활동 사진을 첨부하세요.");
      return;
    }
    try {
      setSubmitting(true);

      // 사진을 새로 골랐으면 S3 업로드 → URL 획득. 수정 모드에서 안 바꿨으면 기존 URL 유지.
      let imageUrl = reportImage;
      if (photoFile) {
        const up = await reportApi.uploadImage(photoFile);
        imageUrl = up.data.data;
      }

      // type은 서버가 그룹 기준으로 자동 판단하므로 전송하지 않음.
      const body: Record<string, unknown> = {
        title,
        content: activity,
        reflection,
        nextPlan,
        location,
        date: startDate.toISOString(),
        memberIds: selectedMemberIds,
        reportImage: imageUrl,
      };
      // 수정 시 그룹은 변경 불가(백엔드가 groupId 미수용) → 신규 작성만 전송
      if (!isEdit) body.groupId = groupId;
      if (reportFile) body.reportFile = reportFile;

      if (isEdit && editId) {
        await reportApi.update(Number(editId), body);
      } else {
        await reportApi.create(body);
      }
      router.push("/report");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      alert(
        (isEdit ? "수정에 실패했습니다." : "저장에 실패했습니다.") +
          (msg ? `\n(${msg})` : ""),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedGroupName = groups.find((g) => g.groupId === groupId)?.groupName;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 border-0 no-underline">{isEdit ? "보고서 수정" : "새 보고서 업로드"}</h1>
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
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-gray-800 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isEdit ? "수정" : "저장"}
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
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-report-ring"
              />
            </div>
            <div className="space-y-1.5" ref={dropdownRef}>
              <label className="text-sm font-medium text-gray-700">
                스터디/프로젝트 명
              </label>
              <div className="relative">
                <button
                  type="button"
                  disabled={isEdit}
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-report-ring bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <span className={groupId ? "text-gray-700" : "text-gray-400"}>
                    {selectedGroupName ?? "선택 가능 (본인이 속한 스터디)"}
                  </span>
                  {!isEdit && (
                    <ChevronDown size={15} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  )}
                </button>
                {dropdownOpen && !isEdit && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
                    {groups.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-gray-400">가입한 스터디/프로젝트가 없습니다</li>
                    ) : (
                      groups.map((g) => (
                        <li key={g.groupId}>
                          <button
                            type="button"
                            onClick={() => { handleGroupChange(g.groupId); setDropdownOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 transition-colors ${
                              groupId === g.groupId ? "bg-report-soft" : "hover:bg-gray-50"
                            }`}
                          >
                            {g.groupName}
                            {groupId === g.groupId && <Check size={13} className="text-gray-700" />}
                          </button>
                        </li>
                      ))
                    )}
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
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-report-ring bg-white"
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
                value={userName}
                readOnly
                autoComplete="off"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          {/* 활동 장소 (유형은 서버가 그룹 기준으로 자동 판단 → 입력 UI 불필요) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">활동 장소</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 동아리방, 온라인 등"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-report-ring"
            />
          </div>

          {/* 파일 업로드 (사진 1장 — 제출 시 S3 업로드 후 URL 전송) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">파일 업로드</label>

            {isEdit && reportImage && !photoFile && (
              <p className="text-xs text-gray-400">기존 사진이 첨부되어 있습니다. 새로 올리면 교체됩니다.</p>
            )}

            {files.length === 0 ? (
              /* 빈 상태 — 드래그&드롭 존 */
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); pickPhoto(e.dataTransfer.files?.[0]); }}
                className="flex items-center justify-between gap-3 border border-dashed border-gray-300 rounded-lg px-3 h-11 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 text-gray-400">
                    <Paperclip size={13} />
                  </span>
                  <span className="text-sm text-gray-400 truncate">
                    버튼 선택 또는 첨부파일을 선택하여 이곳에 드래그&드롭해 주세요.
                  </span>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-300 text-xs font-medium text-gray-600">
                  <Monitor size={13} /> 내 컴퓨터 찾기
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ""; }}
                />
              </label>
            ) : (
              /* 선택됨 — 파일명 + 크기 + 제거 */
              <div className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 rounded-lg px-3 h-11 border border-gray-200">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 px-2 py-0.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700">사진</span>
                  <span className="truncate">{files[0].name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-xs text-gray-400">{files[0].size}</span>
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    × 제거
                  </button>
                </div>
              </div>
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
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-report-ring resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">참여자 명단</label>
              <div className="w-full border border-gray-200 rounded-lg px-3 py-2 min-h-[120px]">
                {groupId == null ? (
                  <p className="text-sm text-gray-400">스터디/프로젝트를 먼저 선택하세요</p>
                ) : members.length === 0 ? (
                  <p className="text-sm text-gray-400">참여 가능한 멤버가 없습니다</p>
                ) : (
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {members.map((m) => {
                      const checked = selectedMemberIds.includes(m.userId);
                      return (
                        <label key={m.userId} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleMember(m.userId)}
                            className="sr-only peer"
                          />
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-gray-400 ${
                              checked ? "bg-gray-800 border-gray-800" : "bg-white border-gray-300"
                            }`}
                          >
                            {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                          </span>
                          {m.userGeneration}기 {m.userName}
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
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-report-ring resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">다음 주 계획</label>
              <textarea
                value={nextPlan}
                onChange={(e) => setNextPlan(e.target.value)}
                rows={4}
                placeholder="다음 주 계획을 입력하세요"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-report-ring resize-none"
              />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
