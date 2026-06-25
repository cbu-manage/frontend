import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Chip from "./Chip";

/**
 * 선택형 필터 칩. 게시판 카테고리 필터 등. (Figma: Component/chip)
 */
const meta = {
  title: "Common/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

const CATEGORIES = ["전체", "일상", "질문", "잡담", "홍보"];

function ChipGroupDemo() {
  const [selected, setSelected] = useState("전체");
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => (
        <Chip key={c} selected={selected === c} onClick={() => setSelected(c)}>
          {c}
        </Chip>
      ))}
    </div>
  );
}

export const Group: Story = {
  render: () => <ChipGroupDemo />,
};

export const States: Story = {
  render: () => (
    <div className="flex gap-2">
      <Chip selected>선택됨</Chip>
      <Chip>선택 안 됨</Chip>
    </div>
  ),
};
