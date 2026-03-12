"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { studyApi } from "@/api";
import type { StudyStatus } from "@/components/study/StudyCard";

/** 화면 너비에 따른 페이지당 출력 개수: lg(1024px) 이상 12, md(768px) 이상 9, 미만 6 */
function useResponsivePageSize(): number {
  const [size, setSize] = useState(12);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1024) setSize(12);
      else if (w >= 768) setSize(9);
      else setSize(6);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

export interface StudyListItem {
  id: number;
  title: string;
  status: StudyStatus | string;
  category?: string;
  createdAt?: string;
  /** 현재 인원 / 최대 인원 (리스트 카드용) */
  activeMembers?: number;
  maxMembers?: number;
  [key: string]: unknown;
}

export interface StudyListResult {
  items: StudyListItem[];
  totalPages: number;
}

type UseStudyListParams = {
  page: number;
  status: StudyStatus;
  category: string;
  enabled?: boolean;
};

/** 스터디 게시판 category = 1 고정 (프로젝트=2) */
const STUDY_BOARD_CATEGORY = 1;

function normalizeResponse(
  raw: unknown,
  { status }: Pick<UseStudyListParams, "status">,
): StudyListResult {
  let list: StudyListItem[] = [];
  let totalPages = 1;

  if (Array.isArray(raw)) {
    list = raw as StudyListItem[];
  } else if (raw && typeof raw === "object") {
    const anyRaw = raw as unknown;
    if (Array.isArray((anyRaw as { content: StudyListItem[] }).content)) {
      list = (anyRaw as { content: StudyListItem[] }).content;
    }
    if (
      typeof (anyRaw as { totalPages: number }).totalPages === "number" &&
      (anyRaw as { totalPages: number }).totalPages > 0
    ) {
      totalPages = (anyRaw as { totalPages: number }).totalPages;
    }
  }

  // API는 postId + recruiting, UI는 id + status 사용 → 매핑
  const items = list.map((item) => {
    const raw = item as {
      postId?: number;
      id?: number;
      recruiting?: boolean;
      activeMembers?: number;
      maxMembers?: number;
    };
    return {
      ...item,
      id: raw.postId ?? raw.id ?? 0,
      status: raw.recruiting === true ? "모집 중" : raw.recruiting === false ? "모집 완료" : (item.status as string),
      activeMembers: raw.activeMembers,
      maxMembers: raw.maxMembers,
    };
  });

  // 프론트에서 상태 필터 1차 적용 (백엔드가 이미 필터링했더라도 안전하게)
  const filtered = items.filter((item) => {
    const statusMatch = !item.status || (item.status as string) === status;
    return statusMatch;
  });

  return {
    items: filtered,
    totalPages,
  };
}

export function useStudyList({
  page,
  status,
  category,
  enabled = true,
}: UseStudyListParams) {
  const pageSize = useResponsivePageSize();

  const isTagFilter = category !== "전체";

  return useQuery({
    queryKey: ["studies", page, status, category, pageSize],
    queryFn: async () => {
      const pageIndex = Math.max(page - 1, 0);

      if (isTagFilter) {
        const res = await studyApi.filterByTag({
          page: pageIndex,
          size: pageSize,
          tag: category,
        });
        const payload =
          res.data && typeof res.data === "object" && "data" in res.data
            ? (res.data as { data?: unknown }).data
            : res.data;
        return normalizeResponse(payload, { status });
      }

      const res = await studyApi.getList({
        page: pageIndex,
        size: pageSize,
        category: STUDY_BOARD_CATEGORY,
      });
      const payload =
        res.data && typeof res.data === "object" && "data" in res.data
          ? (res.data as { data?: unknown }).data
          : res.data;
      return normalizeResponse(payload, { status });
    },
    enabled,
  });
}
