"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Clock, Eye, MapPin } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import { useUserStore } from "@/store/userStore";
import KebabMenu from "@/components/common/KebabMenu";
import Mascot, { type MascotEmotion } from "@/components/common/Mascot";
import { StatusBadge } from "@/components/common/StatusBadge";

// TODO: API 연동 후 교체
const MOCK_MEETING = {
  id: 1,
  userId: 1, // 작성자(운영진) id — currentUserId와 비교해 본인 여부 판단
  category: "모임",
  done: false, // 모집 중
  title: "여름 워크샵 1박 2일 MT",
  author: "34기 씨부엉",
  date: "2026. 01. 30",
  views: 122,
  time: "2026.04.20 (토) 18:00",
  location: "학교 후문 OO치킨 2층",
  content: `안녕하세요, 운영진입니다. 이번 신입 환영회 일정을 공유합니다.

‣ 일시 : 2026.04.20 (토) 오후 6시
‣ 장소 : 학교 후문 'OO치킨' 2층
‣ 회비 : 인당 18,000원 (현장 수령)
‣ 응답 마감 : 2026.04.17 (목) 자정

※ 신입부원은 웰컴 조용하게 있다가 관점하셔도 됩니다 — 자유 참석이에요 :)`,
  capacity: 15,
};

type VoteKey = "yes" | "no" | "maybe";

const VOTE_OPTIONS: { key: VoteKey; label: string; emotion: MascotEmotion }[] = [
  { key: "yes", label: "참석할게요", emotion: "default" },
  { key: "no", label: "참석이 어려워요", emotion: "sad" },
  { key: "maybe", label: "미정이에요", emotion: "working" },
];

// 투표 결과(데모) — API 연동 시 교체
type Member = { gen: string; name: string };

// 본인(데모) — API 연동 시 로그인 사용자로 교체. 내 선택에 따라 아래 그룹에 포함된다.
const ME: Member = { gen: "15기", name: "김민주" };

// 나를 제외한 다른 부원들의 응답(고정). 내 투표를 바꾸면 내가 해당 그룹으로 이동한다.
const VOTE_GROUPS: {
  key: VoteKey;
  en: string;
  ko: string;
  tone: string;
  base: Member[];
}[] = [
  {
    key: "yes",
    en: "Approval",
    ko: "참석 가능",
    tone: "text-success",
    base: [
      { gen: "14기", name: "이서연" }, { gen: "14기", name: "절준호" },
      { gen: "14기", name: "윤지우" }, { gen: "14기", name: "고은성" },
      { gen: "15기", name: "강성주" }, { gen: "15기", name: "김건우" },
      { gen: "15기", name: "박도윤" }, { gen: "15기", name: "강남규" },
      { gen: "15기", name: "김광현" }, { gen: "15기", name: "정하은" },
      { gen: "15기", name: "이도현" },
    ],
  },
  {
    key: "no",
    en: "Negative",
    ko: "참석 불가능",
    tone: "text-danger",
    base: [
      { gen: "14기", name: "강순철" }, { gen: "14기", name: "김가연" },
      { gen: "15기", name: "강여진" },
    ],
  },
  {
    key: "maybe",
    en: "Waiting",
    ko: "참석 대기",
    tone: "text-[#3bc1e0]",
    base: [
      { gen: "14기", name: "장잇프" }, { gen: "14기", name: "명자동구" },
      { gen: "15기", name: "고은성" },
    ],
  },
];

function MemberList({ members, highlight }: { members: Member[]; highlight?: Member }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
      {members.map((m, i) => {
        const isMe =
          highlight && m.gen === highlight.gen && m.name === highlight.name;
        return (
          <div key={i} className="flex items-center gap-2">
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                isMe ? "bg-success/15 text-success" : "bg-gray-100 text-gray-500"
              }`}
            >
              {m.gen}
            </span>
            <span
              className={`text-sm ${
                isMe ? "font-semibold text-gray-900" : "text-gray-700"
              }`}
            >
              {m.name}
              {isMe ? " (나)" : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function MeetingDetailPage() {
  const router = useRouter();
  const [choice, setChoice] = useState<VoteKey | null>(null);
  const [voted, setVoted] = useState(false);

  const userId = useUserStore((s) => s.userId);
  const currentUserId = userId ? Number(userId) : null;
  const isAuthor = currentUserId != null && currentUserId === MOCK_MEETING.userId;

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-12">
            {/* 상단 바 — 목록으로 / 더보기 */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => router.push("/meeting")}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-5 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              >
                <ChevronLeft size={16} /> 목록으로
              </button>
              <KebabMenu
                onEdit={isAuthor ? () => router.push("/meeting/write") : undefined}
                onDelete={
                  isAuthor
                    ? () => {
                        if (window.confirm("이 모임을 삭제할까요?")) router.push("/meeting");
                      }
                    : undefined
                }
              />
            </div>

            {/* 분류 / 상태 / 제목 / 작성자 / 메타 */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-500">
                {MOCK_MEETING.category}
              </span>
              <StatusBadge tone={MOCK_MEETING.done ? "danger" : "success"}>
                {MOCK_MEETING.done ? "모집 완료" : "모집 중"}
              </StatusBadge>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">{MOCK_MEETING.title}</h1>
            <p className="mt-3 text-base text-gray-600">{MOCK_MEETING.author}</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock size={14} /> {MOCK_MEETING.date}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} /> {MOCK_MEETING.views}
              </span>
            </div>

            {/* 시간 / 장소 정보 카드 */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-2xl border border-gray-200 px-5 py-4 text-sm">
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  <Clock size={16} className="text-gray-400" /> 시간
                </span>
                <span className="h-4 w-px bg-gray-200" />
                <span className="text-gray-900">{MOCK_MEETING.time}</span>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-gray-200 px-5 py-4 text-sm">
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  <MapPin size={16} className="text-gray-400" /> 장소
                </span>
                <span className="h-4 w-px bg-gray-200" />
                <span className="text-gray-900">{MOCK_MEETING.location}</span>
              </div>
            </div>

            {/* 본문 */}
            <div className="whitespace-pre-wrap border-t border-gray-200 mt-6 py-10 text-base leading-relaxed text-gray-900">
              {MOCK_MEETING.content}
            </div>

            {/* 하단 메타 */}
            <div className="flex items-center gap-4 border-b border-gray-200 pb-6 text-sm text-gray-700">
              <span className="flex items-center gap-1">
                <Clock size={16} /> {MOCK_MEETING.date}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={16} /> {MOCK_MEETING.views}
              </span>
            </div>

            {/* 참석 투표 */}
            <section className="mt-8 rounded-2xl bg-gray-50 p-8">
              <p className="text-sm font-semibold text-success">Vote</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">참석 여부를 알려주세요.</h2>
              <p className="mt-2 text-sm text-gray-500">
                참석 여부는 아래 버튼으로 투표해주세요 (초록 버튼 = 현재 선택)
              </p>

              {/* 투표 버튼 */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {VOTE_OPTIONS.map((opt) => {
                  const selected = choice === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setChoice(opt.key)}
                      className={`flex flex-col items-center gap-3 rounded-2xl border-2 py-8 transition-colors ${
                        selected
                          ? "border-success bg-[#def7eb]"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <Mascot emotion={opt.emotion} size="sm" />
                      <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 투표 전: 제출하기 / 투표 후: 응답 명단 (버튼을 바꾸면 내가 해당 그룹으로 이동) */}
              {!voted ? (
                <button
                  type="button"
                  disabled={!choice}
                  onClick={() => setVoted(true)}
                  className="mt-4 w-full rounded-full bg-gradient-to-b from-[#48c281] to-[#58d4c5] py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  제출하기
                </button>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {VOTE_GROUPS.map((g) => {
                    // 내가 고른 그룹에는 본인을 맨 위에 추가 → 선택 변경 시 명단·인원수 즉시 갱신
                    const members = choice === g.key ? [ME, ...g.base] : g.base;
                    return (
                      <div
                        key={g.key}
                        className="rounded-2xl border border-gray-100 bg-white p-5"
                      >
                        <div className="flex items-baseline justify-between">
                          <div>
                            <p className={`text-sm font-bold ${g.tone}`}>{g.en}</p>
                            <p className="text-lg font-bold text-gray-900">{g.ko}</p>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {members.length}명
                          </span>
                        </div>
                        <MemberList members={members} highlight={ME} />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </RequireMember>
  );
}
