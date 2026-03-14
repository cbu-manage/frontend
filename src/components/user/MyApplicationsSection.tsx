"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { groupApi } from "@/api";

type ApplicationTab = "전체보기" | "스터디 모집" | "프로젝트 모집";
type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

interface ApplicationItem {
  groupId: number;
  postId: number;
  postType: "STUDY" | "PROJECT";
  title: string;
  authorName?: string;
  authorGeneration?: number;
  tags: string[];
  activeMemberCount: number;
  maxMembers: number;
  status: ApplicationStatus;
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "거절",
};

function extractApplications(raw: unknown): ApplicationItem[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  const data = obj.data ?? obj;
  let list: unknown[] = [];
  if (Array.isArray(data)) list = data;
  else if (data && typeof data === "object" && "content" in data) {
    const c = (data as { content?: unknown }).content;
    list = Array.isArray(c) ? c : [];
  }
  return list.map((item) => {
    const i = item as Record<string, unknown>;
    const postType = (i.postType ?? i.type ?? "STUDY") as "STUDY" | "PROJECT";
    const status = (i.status ?? i.applicationStatus ?? "PENDING") as ApplicationStatus;
    const tags = (i.studyTags ?? i.recruitmentFields ?? i.tags ?? []) as string[];
    return {
      groupId: (i.groupId as number) ?? 0,
      postId: (i.postId as number) ?? (i.id as number) ?? 0,
      postType,
      title: (i.title as string) ?? "",
      authorName: i.authorName as string | undefined,
      authorGeneration: i.authorGeneration as number | undefined,
      tags,
      activeMemberCount: (i.activeMemberCount as number) ?? 0,
      maxMembers: (i.maxMembers as number) ?? 0,
      status,
    };
  });
}

export default function MyApplicationsSection() {
  const [activeTab, setActiveTab] = useState<ApplicationTab>("전체보기");

  const { data: applicationsRes, isLoading, isError } = useQuery({
    queryKey: ["groups", "my", "applications"],
    queryFn: () => groupApi.getMyApplications(),
  });

  const applications = useMemo(() => {
    const raw = applicationsRes?.data;
    const data = raw && typeof raw === "object" && "data" in raw
      ? (raw as { data?: unknown }).data
      : raw;
    return extractApplications(data);
  }, [applicationsRes]);

  const filtered = useMemo(() => {
    if (activeTab === "전체보기") return applications;
    if (activeTab === "스터디 모집")
      return applications.filter((a) => a.postType === "STUDY");
    return applications.filter((a) => a.postType === "PROJECT");
  }, [applications, activeTab]);

  const counts = useMemo(() => ({
    전체보기: applications.length,
    "스터디 모집": applications.filter((a) => a.postType === "STUDY").length,
    "프로젝트 모집": applications.filter((a) => a.postType === "PROJECT").length,
  }), [applications]);

  const tabItems: ApplicationTab[] = ["전체보기", "스터디 모집", "프로젝트 모집"];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        나의 신청 목록
      </h1>

      {/* 탭 필터 */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
        {tabItems.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`transition-colors ${activeTab === tab ? "text-gray-900 font-semibold" : "text-gray-400"}`}
          >
            {tab}({counts[tab]})
          </button>
        ))}
      </div>

      <div className="border-t border-gray-200" />

      {isLoading && (
        <div className="py-12 text-center text-gray-500">
          신청 목록을 불러오는 중...
        </div>
      )}
      {isError && (
        <div className="py-12 text-center text-red-500">
          신청 목록을 불러오지 못했습니다.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* 테이블 헤더 */}
          <div className="grid grid-cols-12 gap-4 py-4 px-2 text-sm font-medium text-gray-600 border-b border-gray-100">
            <div className="col-span-2">신청 카테고리</div>
            <div className="col-span-6">신청 정보</div>
            <div className="col-span-2">모집인원</div>
            <div className="col-span-2">진행상태</div>
          </div>

          {/* 목록 */}
          <div className="divide-y divide-gray-100">
            {filtered.map((app) => (
              <ApplicationRow key={`${app.postType}-${app.postId}`} item={app} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              {activeTab === "전체보기"
                ? "신청한 내역이 없습니다."
                : `${activeTab} 신청 내역이 없습니다.`}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ApplicationRow({ item }: { item: ApplicationItem }) {
  const href = item.postType === "STUDY" ? `/study/${item.postId}` : `/project/${item.postId}`;
  const categoryLabel = item.postType === "STUDY" ? "스터디" : "프로젝트";
  const authorDisplay =
    item.authorGeneration != null && item.authorName
      ? `${item.authorGeneration}기 ${item.authorName}`
      : item.authorName ?? "";

  const statusClass =
    item.status === "PENDING"
      ? "bg-amber-100 text-amber-800"
      : item.status === "APPROVED"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";

  return (
    <Link
      href={href}
      className="grid grid-cols-12 gap-4 py-5 px-2 items-center hover:bg-gray-50 transition-colors"
    >
      <div className="col-span-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {categoryLabel}
        </span>
      </div>
      <div className="col-span-6 flex flex-col gap-1">
        {authorDisplay && (
          <span className="text-xs text-gray-500">{authorDisplay}</span>
        )}
        <span className="font-semibold text-gray-900 line-clamp-1">{item.title}</span>
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="col-span-2 text-sm text-gray-700">
        {item.activeMemberCount}/{item.maxMembers}
      </div>
      <div className="col-span-2">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}
        >
          {STATUS_LABEL[item.status]}
        </span>
      </div>
    </Link>
  );
}
