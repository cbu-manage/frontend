import type { Meta, StoryObj } from "@storybook/nextjs-vite";

/**
 * Figma "Text styles" 스케일을 CSS 유틸(@utility)로 정의한 것.
 * 표기 = 폰트크기 / 줄높이. 반응형이 필요 없는 px 고정 스펙(버튼·라벨·카드)에 사용.
 * (섹션 제목 등 화면폭에 따라 커져야 하는 곳은 text-display/h1/h2/h3 시맨틱 유틸 사용)
 */
const meta = {
  title: "Foundations/Typography",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Figma Text styles 스케일(Display · Headline · Title · body). globals.css의 @utility로 정의되어 className으로 바로 사용.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ROWS: { cls: string; label: string; spec: string }[] = [
  { cls: "text-display-md", label: "Display / Medium", spec: "45 / 160%" },
  { cls: "text-headline-lg", label: "Headline / Large", spec: "32 / 160%" },
  { cls: "text-headline-md", label: "Headline / Medium", spec: "28 / 160%" },
  { cls: "text-headline-sm", label: "Headline / small", spec: "24 / 160%" },
  { cls: "text-title-lg", label: "Title / Large", spec: "20 / 160%" },
  { cls: "text-title-md", label: "Title / Medium", spec: "16 / 160%" },
  { cls: "text-title-sm", label: "Title / small", spec: "14 / 160%" },
  { cls: "text-body-md", label: "body / body", spec: "16 / 26" },
  { cls: "text-body-rg", label: "body / small", spec: "14 / 21" },
  { cls: "text-body-loose", label: "body / small2", spec: "14 / 160%" },
];

export const Scale: Story = {
  render: () => (
    <div className="flex flex-col gap-6 text-gray-900">
      {ROWS.map((r) => (
        <div key={r.cls} className="flex items-baseline gap-6 border-b border-gray-100 pb-4">
          <div className="w-44 shrink-0 text-sm text-gray-400">
            <div className="font-mono text-gray-600">{r.cls}</div>
            <div>
              {r.label} · {r.spec}
            </div>
          </div>
          <p className={r.cls}>다람쥐 헌 쳇바퀴에 타고파 — 씨부엉 CBU</p>
        </div>
      ))}
    </div>
  ),
};
