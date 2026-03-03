"use client";

import { useParams, useRouter } from "next/navigation";
import DetailTemplate from "@/components/detail/DetailTemplate";
import Sidebar from "@/components/shared/Sidebar";
import { useUserStore } from "@/store/userStore";

const POSITIONS = [
  { label: "전체", value: "전체" },
  { label: "프론트엔드", value: "프론트엔드" },
  { label: "백엔드", value: "백엔드" },
  { label: "개발", value: "개발" },
  { label: "디자인", value: "디자인" },
  { label: "기획", value: "기획" },
  { label: "기타", value: "기타" },
] as const;

const MOCK_DATA = {
  title: "[프로젝트] 커뮤니티 플랫폼 개발 팀원 구합니다",
  status: "recruiting" as const,
  author: "33기 씨부엉",
  date: "2026. 02. 10",
  views: 85,
  infoLabel: "모집 분야",
  categories: ["프론트엔드", "백엔드", "디자인"],
  content: `동아리원들을 위한 커뮤니티 플랫폼을 개발하려고 합니다.
현재 기획은 완료되었으며, 함께 개발할 팀원을 모집합니다!

🚀 기술 스택
• React / Next.js
• Spring Boot
• Figma

👥 모집 인원
• 프론트엔드 2명
• 백엔드 1명
• 디자이너 1명

많은 지원 부탁드립니다!`,
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const { name: currentUserName } = useUserStore();
  
  // 작성자 여부 확인
  const isAuthor = currentUserName === MOCK_DATA.author;

  return (
    <main className="min-h-screen bg-white">
      <div className="flex">
        <Sidebar
          items={POSITIONS}
          selected=""
          onSelect={(val) => router.push(`/project?position=${val}`)}
          writeLink="/project/write"
        />
        <DetailTemplate
          backPath="/project"
          {...MOCK_DATA}
          onEdit={() => {
            const payload = {
              id: String(id),
              title: MOCK_DATA.title,
              categories: MOCK_DATA.categories,
              recruitStatus: MOCK_DATA.status,
              content: MOCK_DATA.content,
            };
            sessionStorage.setItem("editPost_project", JSON.stringify(payload));
            router.push(`/project/write?id=${id}`);
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
