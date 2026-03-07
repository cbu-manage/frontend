"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { studyApi, type StudyListParams } from "@/api";
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

export function useStudyList({
  page,
  status,
  category,
  enabled = true,
}: UseStudyListParams) {
  const pageSize = useResponsivePageSize();

  return useQuery({
    queryKey: ["studies", page, status, category, pageSize],
    queryFn: async () => {
      const paging: StudyListParams = {
        page: Math.max(page - 1, 0),
        size: pageSize,
        category: CATEGORY_CODE_MAP[category] ?? CATEGORY_CODE_MAP["전체"],
      };

      const res = await studyApi.getList(paging);
      return normalizeResponse(res.data, { status });
    },
    enabled,
  });
}
