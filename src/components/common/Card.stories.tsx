import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Card from "./Card";

/**
 * 베이스 카드 컨테이너. 도메인 카드가 감싸 쓴다. (Figma: Component/Card)
 */
const meta = {
  title: "Common/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Card>
        <h3 className="text-base font-semibold text-gray-900">기본 카드</h3>
        <p className="mt-1 text-sm text-gray-600">흰 배경 · 테두리 · 라운드</p>
      </Card>
      <Card muted>
        <h3 className="text-base font-semibold text-gray-900">muted 카드</h3>
        <p className="mt-1 text-sm text-gray-600">완료/비활성 톤 (회색 배경)</p>
      </Card>
    </div>
  ),
};
