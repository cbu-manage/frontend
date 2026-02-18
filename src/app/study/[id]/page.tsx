"use client";

import { useParams, useRouter } from "next/navigation";
import DetailTemplate from "@/components/detail/DetailTemplate";
import Sidebar from "@/components/shared/Sidebar";
import { useUserStore } from "@/store/userStore";

const CATEGORIES = [
  { label: "전체", value: "전체" },
  { label: "C++", value: "C++" },
  { label: "Python", value: "Python" },
  { label: "Java", value: "Java" },
  { label: "알고리즘", value: "알고리즘" },
  { label: "기타", value: "기타" },
] as const;

const MOCK_DATA = {
  title: "[파이선] 코딩 스터디 팀원 모집합니다!",
  status: "recruiting" as const,
  author: "34기 씨부엉",
  date: "2026. 01. 30",
  views: 122,
  infoLabel: "모집 분야",
  categories: ["Python", "알고리즘"],
  content: `혼자 파이썬 공부하다가 막히신 분들,
기초부터 코딩테스트 입문까지 같이 공부할 스터디원 모집합니다!

🔥 내용
• 파이썬 기초 문법
• 간단한 문제 풀이 (백준/프로그래머스)
• 서로 질문-설명하며 진행

🙋 대상
• 파이썬 초보 환영
• 전공/비전공 무관
• 꾸준히 참여 가능하신 분

🗓️ 방식
• 주 1회 온라인
• 디스코드 + 노션

💬 참여
관심 있으시면 댓글 or 쪽지 주세요!`,
};

export default function StudyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const { name: currentUserName } = useUserStore();
  
  // 작성자 여부 확인 (실제로는 API에서 반환된 작성자 ID와 비교)
  const isAuthor = currentUserName === MOCK_DATA.author;

  return (
    <main className="min-h-screen bg-white">
      <div className="flex">
        <Sidebar
          items={CATEGORIES}
          selected=""
          onSelect={(val) => router.push(`/study?category=${val}`)}
          writeLink="/study/write"
        />
        <DetailTemplate
          backPath="/study"
          {...MOCK_DATA}
          onEdit={() => {
            const payload = {
              id: String(id),
              title: MOCK_DATA.title,
              categories: MOCK_DATA.categories,
              recruitStatus: MOCK_DATA.status,
              content: MOCK_DATA.content,
            };
            sessionStorage.setItem("editPost_study", JSON.stringify(payload));
            router.push(`/write/study?id=${id}`);
          }}
          footer={
            <button
              className={
                isAuthor
                  ? "flex items-center justify-center px-5 py-2 gap-[7px] rounded-full border-2 border-brand bg-brand text-white text-base font-semibold hover:opacity-90 transition-all duration-200"
                  : "flex items-center justify-center px-5 py-2 gap-[7px] rounded-full border-2 border-brand bg-white text-brand text-base font-semibold hover:bg-[var(--Brand-100,#F4F9F1)] transition-all duration-200"
              }
            >
              {isAuthor ? "신청 인원 확인" : "신청하기"}
            </button>
          }
        />
      </div>
    </main>
  );
}
