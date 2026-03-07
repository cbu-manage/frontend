"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import PGN from "@/components/shared/Pagination";
import { ProjectCard, ProjectStatus } from "@/components/project/ProjectCard";
import RequireMember from "@/components/auth/RequireMember";
import { useProjectList } from "@/hooks/project";
import { useUserStore } from "@/store/userStore";

const POSITIONS = [
  { label: "전체", value: "전체" },
  { label: "프론트엔드", value: "프론트엔드" },
  { label: "백엔드", value: "백엔드" },
  { label: "개발", value: "개발" },
  { label: "디자인", value: "디자인" },
  { label: "기획", value: "기획" },
  { label: "기타", value: "기타" },
];

function formatDate(iso?: string) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function ProjectPage() {
  const [selectedPosition, setSelectedPosition] = useState("전체");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus>("모집 중");
  const [currentPage, setCurrentPage] = useState(1);

  const name = useUserStore((s) => s.name);
  const isMember = !!name;

  const { data, isLoading, isError } = useProjectList({
    page: currentPage,
    status: statusFilter,
    enabled: isMember,
  });

  const projects = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const filteredProjects =
    selectedPosition === "전체"
      ? projects
      : projects.filter((p) => p.positions.includes(selectedPosition));

  const handleChangeStatus = (status: ProjectStatus) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  return (
    <RequireMember>
      <main className="min-h-screen min-w-[1200px] bg-[#F8FAFF]">
        <div className="flex min-w-[1200px]">
          <Sidebar
            items={POSITIONS}
            selected={selectedPosition}
            onSelect={setSelectedPosition}
            writeLink="/project/write"
          />

          <div className="flex-1 ml-[calc(9.375vw+240px)] pl-6 pr-[9.375%] py-16">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  프로젝트 모집 공고
                </h1>
              </div>

              <div className="flex items-center gap-3 mb-6 text-sm">
                <button
                  onClick={() => handleChangeStatus("모집 중")}
                  className={`flex items-center gap-1 transition-colors ${
                    statusFilter === "모집 중"
                      ? "text-gray-900 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {statusFilter === "모집 중" && (
                    <Check className="w-4 h-4" />
                  )}
                  모집 중
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => handleChangeStatus("모집 완료")}
                  className={`flex items-center gap-1 transition-colors ${
                    statusFilter === "모집 완료"
                      ? "text-gray-900 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {statusFilter === "모집 완료" && (
                    <Check className="w-4 h-4" />
                  )}
                  모집 완료
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {isLoading && (
                  <div className="text-center py-12 text-gray-500">
                    프로젝트 목록을 불러오는 중입니다...
                  </div>
                )}

                {isError && (
                  <div className="text-center py-12 text-red-500">
                    프로젝트 목록을 불러오는 중 오류가 발생했습니다.
                  </div>
                )}

                {!isLoading &&
                  !isError &&
                  filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.postId}
                      id={project.postId}
                      status={project.status}
                      positions={project.positions}
                      title={project.title}
                      author={
                        project.authorGeneration
                          ? `${project.authorGeneration}기 ${project.authorName}`
                          : project.authorName
                      }
                      views={project.viewCount}
                      time={formatDate(project.deadline)}
                      content={project.content}
                    />
                  ))}

                {!isLoading &&
                  !isError &&
                  filteredProjects.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      해당 조건에 맞는 프로젝트가 없습니다.
                    </div>
                  )}
              </div>

              <PGN
                currentPage={currentPage}
                totalPages={pageNumbers}
                onPageChange={(num) => setCurrentPage(num)}
              />
            </div>
          </div>
        </div>
      </main>
    </RequireMember>
  );
}
