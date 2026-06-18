import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StudyCard } from "./StudyCard";

const meta = {
  title: "Cards/StudyCard",
  component: StudyCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    id: 1,
    title: "파이썬 알고리즘 스터디 모집합니다!",
    status: "모집 중",
    categories: ["Python", "알고리즘"],
    authorDisplay: "34기 김민주",
    viewCount: 122,
    time: "3시간 전",
    activeMemberCount: 3,
    maxMembers: 6,
  },
} satisfies Meta<typeof StudyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recruiting: Story = {};
export const Completed: Story = {
  args: { status: "모집 완료", activeMemberCount: 6, maxMembers: 6 },
};
