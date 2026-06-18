import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProjectCard, ProjectRow } from "./ProjectCard";

const meta = {
  title: "Cards/ProjectCard",
  component: ProjectCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[640px] max-w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    id: 1,
    title: "[프론트엔드 모집] 씨부엉 관리 웹 서비스 개발",
    status: "모집 중",
    positions: ["프론트엔드", "백엔드"],
    author: "씨부엉 34기",
    views: 122,
    time: "2026.06.30",
    activeMemberCount: 2,
    maxMembers: 5,
  },
} satisfies Meta<typeof ProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Card: Story = {};
export const Completed: Story = { args: { status: "모집 완료" } };

export const Row: StoryObj = {
  render: () => (
    <ProjectRow
      id={1}
      status="모집 중"
      position="프론트엔드"
      title="[프론트엔드 모집] 씨부엉 관리 웹 서비스 개발"
      author="씨부엉 34기"
      time="2026.06.30"
    />
  ),
};
