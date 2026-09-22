"use client";

import { cn } from "@/lib/utils";

export type TabItem = { label: string; value: string };

type TabsProps = {
  items: TabItem[];
  /** 현재 선택된 값 (controlled) */
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

/**
 * Pill 세그먼트 탭 — 연한 회색 컨테이너 안에서 활성 탭만 brand(올리브)로 채운다.
 * 소식/자유게시판 카테고리 필터 등에 사용. (Figma: Component/Tabs)
 *
 * @example
 *   const [tab, setTab] = useState("all");
 *   <Tabs items={[{label:"전체",value:"all"}]} value={tab} onValueChange={setTab} />
 */
export default function Tabs({
  items,
  value,
  onValueChange,
  className,
}: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-gray-50 p-1.5",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(item.value)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand text-white"
                : "text-gray-700 hover:text-gray-900",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
