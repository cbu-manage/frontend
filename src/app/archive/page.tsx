"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import ArchiveCard from "@/components/archive/card";
import Pagination from "@/components/shared/Pagination";
import RequireMember from "@/components/auth/RequireMember";
import {
  useResourceList,
  useDeleteResource,
} from "@/hooks/archive/useResourceList";

export default function ArchivePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const { data, isLoading, isError } = useResourceList({
    page: currentPage,
    size: itemsPerPage,
  });
  const deleteMutation = useDeleteResource();

  const resources = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <RequireMember>
      <main className="min-h-screen pb-12 bg-white">
        <div className="px-[9.375%]">
          {/* 헤더 섹션 */}
          <div className="pt-12 flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                자료방
              </h1>
              <p className="text-base text-gray-600">
                스터디와 프로젝트에서 공유된 자료들을 한눈에 확인해보세요.
              </p>
            </div>
            <Link href="/archive/write">
              <button className="px-6 py-3 bg-gray-800 text-white rounded-2xl font-medium text-base hover:bg-[#3E434A]/90 transition-colors flex items-center gap-4 shrink-0 whitespace-nowrap tracking-wide">
                <Pencil size={18} />글 작성하기
              </button>
            </Link>
          </div>

          {/* 카드 그리드 */}
          <div className="py-8 md:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {isLoading && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  자료를 불러오는 중입니다...
                </div>
              )}

              {isError && (
                <div className="col-span-full text-center py-12 text-red-500">
                  자료를 불러오는 중 오류가 발생했습니다.
                </div>
              )}

              {!isLoading &&
                !isError &&
                resources.map((item) => (
                  <div key={item.resourceId} className="relative group">
                    <ArchiveCard
                      id={String(item.resourceId)}
                      title={item.title}
                      link={item.link}
                      uploadedBy={
                        item.generation && item.authorName
                          ? `${item.generation}기 ${item.authorName}`
                          : (item.authorName as string) || "씨부엉 멤버"
                      }
                      uploadedAt={
                        item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("ko-KR")
                          : ""
                      }
                      views={(item.views as number) ?? 0}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm("이 자료를 삭제할까요?")
                        ) {
                          deleteMutation.mutate(item.resourceId);
                        }
                      }}
                      className="absolute top-3 right-3 z-10 rounded-full bg-black/60 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

              {!isLoading && !isError && resources.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  등록된 자료가 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pageNumbers}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </main>
    </RequireMember>
  );
}
