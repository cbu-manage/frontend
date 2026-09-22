"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  projectApi,
  type ProjectFieldType,
  type ProjectListParams,
  type ProjectListItem,
  type ProjectListResponse,
} from "@/api/project.api";
import type { ProjectStatus } from "@/components/project/ProjectCard";

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

/** API enum → 한글 라벨 매핑 (프로젝트 모집분야) */
const ENUM_TO_LABEL: Record<string, string> = {
  BACKEND: "백엔드",
  FRONTEND: "프론트엔드",
  DEV: "개발",
  PLANNING: "기획",
  DESIGN: "디자인",
  ETC: "기타",
};

function toDisplayPosition(enumVal: string): string {
  return ENUM_TO_LABEL[enumVal] ?? enumVal;
}

/** 한글 라벨 → API enum. 사이드바 분야 선택을 서버 필터 파라미터로 바꿀 때 */
const LABEL_TO_ENUM: Record<string, ProjectFieldType> = Object.fromEntries(
  Object.entries(ENUM_TO_LABEL).map(([k, v]) => [v, k as ProjectFieldType]),
);

export interface ProjectListResult {
  items: (ProjectListItem & {
    status: ProjectStatus;
    positions: string[];
    activeMemberCount?: number;
    maxMembers?: number;
  })[];
  totalPages: number;
}

type UseProjectListParams = {
  page: number;
  status: ProjectStatus;
  /** 모집 분야 한글 라벨. "전체" 또는 undefined 면 필터 없음 */
  field?: string;
  enabled?: boolean;
};

const PROJECT_CATEGORY = 2 as const;

function normalizeResponse(raw: unknown): ProjectListResult {
  let list: ProjectListItem[] = [];
  let totalPages = 1;

  const payload = raw as { data?: ProjectListResponse } | ProjectListResponse;
  const data =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as { data?: ProjectListResponse }).data
      : (payload as ProjectListResponse);

  if (data?.content) {
    list = data.content;
  }
  if (typeof data?.totalPages === "number" && data.totalPages > 0) {
    totalPages = data.totalPages;
  }

  // 백엔드: activeMemberCount(현재 활동인원), maxMembers(최대 모집인원) 통일
  return {
    items: list.map((item) => {
      const raw = item as {
        activeMemberCount?: number;
        maxMembers?: number;
      };
      return {
        ...item,
        status: (item.recruiting ? "모집 중" : "모집 완료") as ProjectStatus,
        positions: (item.recruitmentFields ?? []).map(toDisplayPosition),
        activeMemberCount: raw.activeMemberCount ?? 0,
        maxMembers: raw.maxMembers ?? 0,
      };
    }),
    totalPages,
  };
}

export function useProjectList({
  page,
  status,
  field,
  enabled = true,
}: UseProjectListParams) {
  const pageSize = useResponsivePageSize();
  const fieldEnum =
    field && field !== "전체" ? LABEL_TO_ENUM[field] : undefined;

  return useQuery({
    queryKey: ["projects", page, status, fieldEnum ?? "ALL", pageSize],
    queryFn: async () => {
      const base = {
        page: Math.max(page - 1, 0),
        size: pageSize,
        recruiting: status === "모집 중",
      };
      // 분야를 고르면 서버 필터 API — 현재 페이지 안에서만 걸러내면 다른 페이지 글이 빠지고 페이지 수도 안 맞는다
      const res = fieldEnum
        ? await projectApi.filterByField({ ...base, fields: fieldEnum })
        : await projectApi.getList({
            ...base,
            category: PROJECT_CATEGORY,
          } satisfies ProjectListParams);
      return normalizeResponse(res.data);
    },
    enabled,
  });
}
