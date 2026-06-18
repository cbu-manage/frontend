"use client";
import { useCallback, useState } from "react";

/**
 * 열림/닫힘 상태 훅 — 모달·드롭다운·아코디언·바텀시트 등.
 *
 * 왜 쓰나: 매번 `useState(false)` + 토글 함수 만들지 말고 이걸로 통일.
 *
 * @example
 * const modal = useDisclosure();
 * <button onClick={modal.open}>열기</button>
 * {modal.isOpen && <Modal onClose={modal.close} />}
 */
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  return { isOpen, open, close, toggle, setIsOpen };
}
