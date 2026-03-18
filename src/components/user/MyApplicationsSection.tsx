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
  PENDING: "승인 대기중",
  ACTIVE: "승인",
  REJECTED: "거절됨",
  INACTIVE: "비활동",
};

const STATUS_BG: Record<MyStatus, string> = {
  PENDING: "#FCBD5E",
  ACTIVE: "#45CD89",
  REJECTED: "#FC5E6E",
  INACTIVE: "#9CA3AF",
};

/** category: 1 = 스터디, 2 = 프로젝트 */
const CATEGORY_STUDY = 1;
const CATEGORY_PROJECT = 2;

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
    const catNum = (i.category as number) ?? 0;
    const postType: "STUDY" | "PROJECT" =
      catNum === CATEGORY_PROJECT ? "PROJECT" : "STUDY";
    const myStatus = (i.myStatus ?? i.status ?? "PENDING") as MyStatus;
    const authorName = (i.leaderName ?? i.authorName ?? i.userName) as
      | string
      | undefined;
    const authorGeneration = (i.leaderGeneration ??
      i.authorGeneration ??
      i.generation) as number | undefined;
    return {
      groupId: (i.groupId as number) ?? 0,
      postId: (i.postId as number) ?? (i.id as number) ?? 0,
      postType,
      title: (i.groupName as string) ?? (i.title as string) ?? "",
      authorName:
        authorName && String(authorName).trim() ? authorName : undefined,
      authorGeneration:
        typeof authorGeneration === "number" ? authorGeneration : undefined,
      tags: [],
      activeMemberCount: (i.activeMemberCount as number) ?? 0,
      maxMembers: (i.maxMembers as number) ?? 0,
      myStatus,
    };
  });
}

const PAGE_SIZE = 10;

/** 탭 → API category 파라미터 (1=스터디, 2=프로젝트, undefined=전체) */
const TAB_TO_CATEGORY: Record<BoardTab, 1 | 2 | undefined> = {
  "전체보기": undefined,
  "스터디 모집": 1,
  "프로젝트 모집": 2,
};

function getTotalFromResponse(res: unknown): number {
  if (!res || typeof res !== "object") return 0;
  const body = (res as { data?: unknown }).data;
  const inner =
    body && typeof body === "object" && "data" in body
      ? (body as { data?: unknown }).data
      : body;
  if (inner && typeof inner === "object" && "totalElements" in inner)
    return (inner as { totalElements?: number }).totalElements ?? 0;
  return 0;
}

export default function MyApplicationsSection() {
  const [activeTab, setActiveTab] = useState<BoardTab>("전체보기");
  const [page, setPage] = useState(0);

  const category = TAB_TO_CATEGORY[activeTab];
  const {
    data: applicationsRes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["groups", "my", "applications", category, page],
    queryFn: () =>
      groupApi.getMyApplications({
        page,
        size: PAGE_SIZE,
        category: category ?? undefined,
      }),
  });

  const { applications, totalElements } = useMemo(() => {
    const raw = applicationsRes?.data;
    const data =
      raw && typeof raw === "object" && "data" in raw
        ? (raw as { data?: unknown }).data
        : raw;
    const list = extractApplications(data);
    const total =
      data && typeof data === "object" && "totalElements" in data
        ? (data as { totalElements?: number }).totalElements ?? list.length
        : list.length;
    return { applications: list, totalElements: total };
  }, [applicationsRes]);

  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

  const allRes = useQuery({
    queryKey: ["groups", "my", "applications", undefined, 0],
    queryFn: () =>
      groupApi.getMyApplications({ page: 0, size: 1, category: undefined }),
  });
  const studyRes = useQuery({
    queryKey: ["groups", "my", "applications", 1, 0],
    queryFn: () =>
      groupApi.getMyApplications({ page: 0, size: 1, category: 1 }),
  });
  const projectRes = useQuery({
    queryKey: ["groups", "my", "applications", 2, 0],
    queryFn: () =>
      groupApi.getMyApplications({ page: 0, size: 1, category: 2 }),
  });

  const counts = useMemo(
    () => ({
      전체보기: getTotalFromResponse(allRes.data),
      "스터디 모집": getTotalFromResponse(studyRes.data),
      "프로젝트 모집": getTotalFromResponse(projectRes.data),
    }),
    [allRes.data, studyRes.data, projectRes.data],
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
            onClick={() => {
              setActiveTab(tab);
              setPage(0);
            }}
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
            {applications.map((app) => (
              <ApplicationRow
                key={`${app.postType}-${app.groupId}-${app.postId}`}
                item={app}
              />
            ))}
          </div>

          {applications.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              {activeTab === "전체보기"
                ? "신청한 내역이 없습니다."
                : `${activeTab} 신청 내역이 없습니다.`}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 py-6">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
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
