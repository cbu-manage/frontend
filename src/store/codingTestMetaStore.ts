/**
 * 코딩테스트 필터/폼용 메타 데이터 (플랫폼, 언어, 카테고리)
 * GET /post/platforms, /post/languages, /post/categories 로 채움
 */
import { create } from "zustand";
import type { PlatformItem, LanguageItem, CategoryItem } from "@/api/codingTest.api";

type CodingTestMetaState = {
  platforms: PlatformItem[];
  languages: LanguageItem[];
  categories: CategoryItem[];
  setPlatforms: (list: PlatformItem[]) => void;
  setLanguages: (list: LanguageItem[]) => void;
  setCategories: (list: CategoryItem[]) => void;
};

export const useCodingTestMetaStore = create<CodingTestMetaState>((set) => ({
  platforms: [],
  languages: [],
  categories: [],
  setPlatforms: (list) => set({ platforms: list }),
  setLanguages: (list) => set({ languages: list }),
  setCategories: (list) => set({ categories: list }),
}));
