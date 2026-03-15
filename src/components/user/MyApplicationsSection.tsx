"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { groupApi } from "@/api";

/** API myStatus 값 */
type MyStatus = "PENDING" | "ACTIVE" | "REJECTED" | "INACTIVE";

type BoardTab = "전체보기" | "스터디 모집" | "프로젝트 모집";

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
  myStatus: MyStatus;
}

const STATUS_LABEL: Record<MyStatus, string> = {
  PENDING: "대기",
  ACTIVE: "승인",
  REJECTED: "거절",
  INACTIVE: "비활동",
};

const STATUS_BG: Record<MyStatus, string> = {
  PENDING: "#FCBD5E",
  ACTIVE: "#45CD89",
  REJECTED: "#FC5E6E",
  INACTIVE: "#9CA3AF",
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
    const nested = (i.post ?? i.study ?? i.project ?? i.recruitment) as
      | Record<string, unknown>
      | undefined;
    const src = nested && typeof nested === "object" ? { ...i, ...nested } : i;

    const postType = (src.postType ?? src.type ?? "STUDY") as
      | "STUDY"
      | "PROJECT";
    const myStatus = (src.myStatus ?? src.status ?? "PENDING") as MyStatus;
    const tags = (src.studyTags ??
      src.recruitmentFields ??
      src.tags ??
      []) as string[];
    const authorName = (src.authorName ??
      src.writerName ??
      src.userName ??
      src.leaderName ??
      src.memberName ??
      src.name) as string | undefined;
    const authorGeneration = (src.authorGeneration ??
      src.writerGeneration ??
      src.generation ??
      src.userGeneration ??
      src.leaderGeneration) as number | undefined;
    return {
      groupId: (i.groupId as number) ?? 0,
      postId:
        (src.postId as number) ??
        (src.id as number) ??
        (i.postId as number) ??
        0,
      postType,
      title: (src.title as string) ?? (src.groupName as string) ?? "",
      authorName:
        authorName && String(authorName).trim() ? authorName : undefined,
      authorGeneration:
        typeof authorGeneration === "number" ? authorGeneration : undefined,
      tags,
      activeMemberCount:
        (src.activeMemberCount as number) ??
        (i.activeMemberCount as number) ??
        0,
      maxMembers: (src.maxMembers as number) ?? (i.maxMembers as number) ?? 0,
      myStatus,
    };
  });
}

export default function MyApplicationsSection() {
  const [activeTab, setActiveTab] = useState<BoardTab>("전체보기");

  const {
    data: applicationsRes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["groups", "my", "applications"],
    queryFn: () => groupApi.getMyApplications(),
  });

  const applications = useMemo(() => {
    const raw = applicationsRes?.data;
    const data =
      raw && typeof raw === "object" && "data" in raw
        ? (raw as { data?: unknown }).data
        : raw;
    return extractApplications(data);
  }, [applicationsRes]);

  const filtered = useMemo(() => {
    if (activeTab === "전체보기") return applications;
    if (activeTab === "스터디 모집")
      return applications.filter((a) => a.postType === "STUDY");
    if (activeTab === "프로젝트 모집")
      return applications.filter((a) => a.postType === "PROJECT");
    return applications;
  }, [applications, activeTab]);

  const counts = useMemo(
    () => ({
      전체보기: applications.length,
      "스터디 모집": applications.filter((a) => a.postType === "STUDY").length,
      "프로젝트 모집": applications.filter((a) => a.postType === "PROJECT")
        .length,
    }),
    [applications],
  );

  const tabItems: BoardTab[] = ["전체보기", "스터디 모집", "프로젝트 모집"];

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        나의 신청 목록
      </h1>

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

      <div className="border-t border-gray-900" />

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
          <div className="grid grid-cols-12 gap-4 py-4 px-2 text-sm font-medium text-gray-900 border-b border-gray-100 items-center">
            <div className="col-span-2 flex items-center justify-center">
              신청 카테고리
            </div>
            <div className="col-span-6 flex items-center justify-center">
              신청 정보
            </div>
            <div className="col-span-2 flex items-center justify-center">
              모집인원
            </div>
            <div className="col-span-2 flex items-center justify-center">
              진행상태
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filtered.map((app) => (
              <ApplicationRow
                key={`${app.postType}-${app.groupId}-${app.postId}`}
                item={app}
              />
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
  const href =
    item.postType === "STUDY"
      ? `/study/${item.postId}`
      : `/project/${item.postId}`;
  const categoryLabel = item.postType === "STUDY" ? "스터디" : "프로젝트";
  const authorDisplay = item.authorName
    ? item.authorGeneration != null
      ? `${item.authorGeneration}기 ${item.authorName}`
      : item.authorName
    : "";
  const label = STATUS_LABEL[item.myStatus];
  const bgColor = STATUS_BG[item.myStatus];

  return (
    <div className="grid grid-cols-12 gap-4 py-5 px-2 items-center hover:bg-gray-50/50 transition-colors rounded-lg">
      <div className="col-span-2 flex items-center justify-center">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {categoryLabel}
        </span>
      </div>
      <Link
        href={href}
        className="col-span-6 flex flex-col gap-1.5 hover:opacity-90 min-w-0 justify-center items-start"
      >
        {authorDisplay && (
          <span className="text-sm text-gray-600">{authorDisplay}</span>
        )}
        <span className="font-semibold text-gray-900 line-clamp-1">
          {item.title}
        </span>
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
      </Link>
      <div className="col-span-2 flex items-center justify-center text-sm text-gray-700">
        {item.activeMemberCount}/{item.maxMembers}
      </div>
      <div className="col-span-2 flex items-center justify-center">
        <span
          className="inline-flex items-center justify-center rounded-lg px-5 py-1.5 text-white text-sm font-semibold"
          style={{
            backgroundColor: bgColor,
            fontFamily: "Pretendard, sans-serif",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
