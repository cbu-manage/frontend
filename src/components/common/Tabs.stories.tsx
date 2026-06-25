import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Tabs, { type TabItem } from "./Tabs";

const ITEMS: TabItem[] = [
  { label: "전체", value: "all" },
  { label: "공지", value: "notice" },
  { label: "이벤트", value: "event" },
  { label: "뉴스레터", value: "newsletter" },
  { label: "IT소식", value: "it" },
];

/**
 * Pill 세그먼트 탭. 소식/자유게시판 카테고리 필터용.
 * (Figma: Component/Tabs — 활성 brand 올리브, 비활성 회색)
 */
const meta = {
  title: "Common/Tabs",
  component: Tabs,
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

function TabsDemo({ items }: { items: TabItem[] }) {
  const [value, setValue] = useState(items[0].value);
  return <Tabs items={items} value={value} onValueChange={setValue} />;
}

export const Default: Story = {
  render: () => <TabsDemo items={ITEMS} />,
};

export const TwoTabs: Story = {
  render: () => (
    <TabsDemo
      items={[
        { label: "전체", value: "all" },
        { label: "내 그룹", value: "group" },
      ]}
    />
  ),
};
