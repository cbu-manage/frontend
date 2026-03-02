"use client";

import { useQuery } from "@tanstack/react-query";
import { studyApi, type StudyListParams } from "@/api";
import type { StudyStatus } from "@/components/study/StudyCard";

const PAGE_SIZE = 9;

export interface StudyListItem {
  id: number;
  title: string;
  status: StudyStatus | string;
  category?: string;
  createdAt?: string;
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
};

// 백엔드 카테고리 enum과 프론트 카테고리 문자열 매핑
// 추정 매핑: 0=전체, 1=C++, 2=Python, 3=Java, 4=알고리즘, 5=기타
const CATEGORY_CODE_MAP: Record<string, number> = {
  전체: 0,
  "C++": 1,
  Python: 2,
  Java: 3,
  알고리즘: 4,
  기타: 5,
};

function normalizeResponse(
  raw: unknown,
  { status }: Pick<UseStudyListParams, "status">,
): StudyListResult {
  let list: StudyListItem[] = [];
  let totalPages = 1;

  if (Array.isArray(raw)) {
    list = raw as StudyListItem[];
  } else if (raw && typeof raw === "object") {
    const anyRaw = raw as any;
    if (Array.isArray(anyRaw.content)) {
      list = anyRaw.content as StudyListItem[];
    }
    if (typeof anyRaw.totalPages === "number" && anyRaw.totalPages > 0) {
      totalPages = anyRaw.totalPages;
    }
  }

  // 프론트에서 상태 필터 1차 적용 (백엔드가 이미 필터링했더라도 안전하게)
  list = list.filter((item) => {
    const statusMatch = !item.status || (item.status as string) === status;
    return statusMatch;
  });

  return {
    items: list,
    totalPages,
  };
}

export function useStudyList({ page, status, category }: UseStudyListParams) {
  return useQuery({
    queryKey: ["studies", page, status, category],
    queryFn: async () => {
      const paging: StudyListParams = {
        page: Math.max(page - 1, 0),
        size: PAGE_SIZE,
        category: CATEGORY_CODE_MAP[category] ?? CATEGORY_CODE_MAP["전체"],
      };

      const res = await studyApi.getList(paging);
      return normalizeResponse(res.data, { status });
    },
  });
}

