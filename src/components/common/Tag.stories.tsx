import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tag } from "./Tag";

const meta = {
  title: "Common/Tag",
  component: Tag,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "카테고리/포지션 태그 칩 (Figma: chip). 카드의 작은 회색 태그. gray(기본)·brand(브랜드 틴트) 변형.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["gray", "brand"] },
  },
  args: { variant: "gray", children: "Python" },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gray: Story = { args: { variant: "gray", children: "Python" } };
export const Brand: Story = { args: { variant: "brand", children: "프론트엔드" } };

export const Group: Story = {
  render: () => (
    <div className="flex flex-wrap gap-1.5">
      <Tag>C++</Tag>
      <Tag>Python</Tag>
      <Tag>알고리즘</Tag>
      <Tag variant="brand">프론트엔드</Tag>
      <Tag variant="brand">백엔드</Tag>
    </div>
  ),
};
