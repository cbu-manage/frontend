import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusBadge } from "./StatusBadge";

const meta = {
  title: "Common/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "모집/해결 상태 배지 (Figma: Tag_모집). success=초록(#45cd89), danger=빨강(#fc5e6e). 카드의 '모집 중/완료', '해결/미해결'에 사용.",
      },
    },
  },
  argTypes: {
    tone: { control: "inline-radio", options: ["success", "danger"] },
    size: { control: "inline-radio", options: ["sm", "lg"] },
  },
  args: { tone: "success", size: "sm", children: "모집 중" },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = { args: { tone: "success", children: "모집 중" } };
export const Danger: Story = { args: { tone: "danger", children: "모집 완료" } };
export const Large: Story = { args: { size: "lg", children: "모집 중" } };

export const All: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <StatusBadge tone="success">모집 중</StatusBadge>
      <StatusBadge tone="danger">모집 완료</StatusBadge>
      <StatusBadge tone="success">해결</StatusBadge>
      <StatusBadge tone="danger">미해결</StatusBadge>
      <StatusBadge tone="success" size="lg">
        모집 중
      </StatusBadge>
      <StatusBadge tone="danger" size="lg">
        모집 완료
      </StatusBadge>
    </div>
  ),
};
