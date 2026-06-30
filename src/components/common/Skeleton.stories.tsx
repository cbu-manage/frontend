import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Skeleton, SkeletonText } from "./Skeleton";

const meta = {
  title: "Common/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "콘텐츠 로딩 자리표시자(회색 펄스). 크기는 className으로 지정. 버튼/인라인 로딩은 LoadingSpinner 사용.",
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = { args: { className: "h-4 w-48" } };

export const 텍스트: Story = {
  render: () => <SkeletonText lines={3} className="w-80" />,
};

export const 카드: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4 rounded-2xl border border-gray-200 p-6">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-5 w-2/3" />
      <SkeletonText lines={2} />
    </div>
  ),
};
