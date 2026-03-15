"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  projectApi,
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
  enabled?: boolean;
};

const PROJECT_CATEGORY = 2 as const;

function normalizeResponse(raw: unknown): ProjectListResult {
  let list: ProjectListItem[] = [];
  let totalPages = 1;

  const payload = raw as { data?: ProjectListResponse } | ProjectListResponse;
  const data = payload && typeof payload === "object" && "data" in payload
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
        maxMember?: number; // 프로젝트 예전 필드명 fallback
      };
      return {
        ...item,
        status: (item.recruiting ? "모집 중" : "모집 완료") as ProjectStatus,
        positions: (item.recruitmentFields ?? []).map(toDisplayPosition),
        activeMemberCount: raw.activeMemberCount ?? 0,
        maxMembers: raw.maxMembers ?? raw.maxMember ?? 0,
      };
    }),
    totalPages,
  };
}

export function useProjectList({
  page,
  status,
  enabled = true,
}: UseProjectListParams) {
  const pageSize = useResponsivePageSize();

  return useQuery({
    queryKey: ["projects", page, status, pageSize],
    queryFn: async () => {
      const params: ProjectListParams = {
        page: Math.max(page - 1, 0),
        size: pageSize,
        category: PROJECT_CATEGORY,
        recruiting: status === "모집 중",
      };

      const res = await projectApi.getList(params);
      return normalizeResponse(res.data);
    },
    enabled,
  });
}
