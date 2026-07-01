"use client";
import { useEffect, useRef } from "react";

type UseInfiniteScrollOptions = {
  /** 더 불러올 페이지가 있는지 */
  hasMore: boolean;
  /** 현재 로딩 중인지 — 중복 호출 방지 */
  isLoading: boolean;
  /** 감지 요소가 뷰포트에 들어오면 호출 (다음 페이지 로드) */
  onLoadMore: () => void;
  /** 미리 로드 여백 (기본 200px 앞서 트리거) */
  rootMargin?: string;
};

/**
 * 무한스크롤 훅 — 반환한 ref를 리스트 끝 "sentinel" 요소에 달면,
 * 그 요소가 뷰포트에 들어올 때 onLoadMore를 호출한다.
 *
 * 왜 쓰나: 목록을 페이지 단위로 이어 붙이는(무한스크롤) 로직을 컴포넌트 밖으로 분리해 재사용.
 *
 * @example
 * const sentinelRef = useInfiniteScroll<HTMLDivElement>({
 *   hasMore: hasNextPage,
 *   isLoading: isFetchingNextPage,
 *   onLoadMore: fetchNextPage,
 * });
 * <div ref={sentinelRef} />
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLElement>({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = "200px",
}: UseInfiniteScrollOptions) {
  const ref = useRef<T>(null);
  // onLoadMore가 매 렌더 새로 만들어져도 observer를 재등록하지 않도록 ref로 고정
  const onLoadMoreRef = useRef(onLoadMore);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoading, rootMargin]);

  return ref;
}
