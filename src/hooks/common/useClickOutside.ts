"use client";
import { useEffect, useRef } from "react";

/**
 * 바깥 클릭 감지 훅 — ref 요소 바깥을 클릭하면 handler 실행.
 *
 * 왜 쓰나: 드롭다운·팝오버·메뉴를 "바깥 누르면 닫기".
 * 팁: handler는 매 렌더 새로 만들면 effect가 재등록되니, 필요시 useCallback으로 감싸기.
 *
 * @example
 * const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
 * <div ref={ref}>...드롭다운 내용...</div>
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [handler]);
  return ref;
}
