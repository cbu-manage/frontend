"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { codingTestApi } from "@/api";
import { useCodingTestMetaStore } from "@/store/codingTestMetaStore";
import type { PlatformItem, LanguageItem, CategoryItem } from "@/api";

function extractList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object" && "data" in raw)
    return Array.isArray((raw as { data: unknown }).data)
      ? ((raw as { data: unknown }).data as T[])
      : [];
  return [];
}

/** 코딩테스트 페이지/작성 페이지에서 호출. 플랫폼/언어/카테고리를 fetch 해서 store에 채움 */
export function useCodingTestMeta() {
  const setPlatforms = useCodingTestMetaStore((s) => s.setPlatforms);
  const setLanguages = useCodingTestMetaStore((s) => s.setLanguages);
  const setCategories = useCodingTestMetaStore((s) => s.setCategories);

  const platformsRes = useQuery({
    queryKey: ["codingTest", "platforms"],
    queryFn: () => codingTestApi.getPlatforms(),
  });
  const languagesRes = useQuery({
    queryKey: ["codingTest", "languages"],
    queryFn: () => codingTestApi.getLanguages(),
  });
  const categoriesRes = useQuery({
    queryKey: ["codingTest", "categories"],
    queryFn: () => codingTestApi.getCategories(),
  });

  useEffect(() => {
    const raw = platformsRes.data?.data;
    const list = extractList<PlatformItem>(raw ?? (platformsRes.data as unknown));
    if (list.length > 0) setPlatforms(list);
  }, [platformsRes.data, setPlatforms]);

  useEffect(() => {
    const raw = languagesRes.data?.data;
    const list = extractList<LanguageItem>(raw ?? (languagesRes.data as unknown));
    if (list.length > 0) setLanguages(list);
  }, [languagesRes.data, setLanguages]);

  useEffect(() => {
    const raw = categoriesRes.data?.data;
    const list = extractList<CategoryItem>(raw ?? (categoriesRes.data as unknown));
    if (list.length > 0) setCategories(list);
  }, [categoriesRes.data, setCategories]);

  return {
    isLoading:
      platformsRes.isLoading || languagesRes.isLoading || categoriesRes.isLoading,
    isError:
      platformsRes.isError || languagesRes.isError || categoriesRes.isError,
  };
}
