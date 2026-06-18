import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import LongBtn from "./LongBtn";
import ShortBtn from "./ShortBtn";
import OutlineBtn from "./OutlineBtn";

/**
 * 공통 버튼 3종. 디자인 시스템상 버튼 정리(Button variants) 작업 전,
 * 현재 사용 중인 버튼들을 한 곳에서 비교/검수하기 위한 스토리.
 */
const meta = {
  title: "Common/Buttons",
  component: LongBtn,
  tags: ["autodocs"],
} satisfies Meta<typeof LongBtn>;

export default meta;
// render 전용 스토리 모음이라 args 불필요 → 제네릭 없는 StoryObj 사용
type Story = StoryObj;

export const Long: Story = {
  name: "LongBtn (full-width 브랜드)",
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <LongBtn>제출하기</LongBtn>
      <LongBtn disabled>제출하기 (disabled)</LongBtn>
    </div>
  ),
};

export const Short: Story = {
  name: "ShortBtn (다크)",
  render: () => (
    <div className="flex items-center gap-3">
      <ShortBtn>다음</ShortBtn>
      <ShortBtn disabled>다음 (disabled)</ShortBtn>
    </div>
  ),
};

export const Outline: Story = {
  name: "OutlineBtn",
  render: () => (
    <div className="flex items-center gap-3">
      <OutlineBtn>이전</OutlineBtn>
      <OutlineBtn disabled>이전 (disabled)</OutlineBtn>
    </div>
  ),
};
