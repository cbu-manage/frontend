"use client";
import { useEffect, useState } from "react";

/**
 * 디바운스 훅 — 값이 delay(ms) 동안 더 안 바뀌면 그때 반영.
 *
 * 왜 쓰나: 검색 입력처럼 타이핑마다 API 치면 과하니, "멈추면 한 번만".
 *
 * @example
 * const [keyword, setKeyword] = useState("");
 * const debounced = useDebounce(keyword, 300);
 * useQuery({ queryKey: ["search", debounced], queryFn: ... }); // debounced로 조회
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
