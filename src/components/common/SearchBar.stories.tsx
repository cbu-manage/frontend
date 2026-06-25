import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SearchBar from "./SearchBar";

/**
 * 검색 입력. 목록 페이지 상단 검색용. (Figma: Component/search bar)
 */
const meta = {
  title: "Common/SearchBar",
  component: SearchBar,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

function SearchBarDemo() {
  const [q, setQ] = useState("");
  return (
    <div className="w-96">
      <SearchBar value={q} onChange={(e) => setQ(e.target.value)} />
    </div>
  );
}

export const Default: Story = {
  render: () => <SearchBarDemo />,
};
