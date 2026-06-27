import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import MeetingCard from "./MeetingCard";

const meta = {
  title: "Meeting/MeetingCard",
  component: MeetingCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "모임 목록 카드 (Figma: Card · 참석 응답). 분류 칩(모임/MT/회식) + 모집 상태 배지 + 제목 + 일시·장소 + 참석 응답 원형. done=true면 회색 톤 + '최종 참석'. href를 주면 카드 전체가 링크가 됨.",
      },
    },
  },
  argTypes: {
    category: { control: "inline-radio", options: ["모임", "MT", "회식"] },
    done: { control: "boolean" },
  },
  args: {
    category: "모임",
    done: false,
    title: "2026 봄학기 신입 환영회",
    date: "2026.04.20 (토) 18:00",
    location: "학교 후문 OO치킨 2층",
    responded: 16,
    capacity: 15,
  },
} satisfies Meta<typeof MeetingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 모집중: Story = {};

export const 모집완료: Story = {
  args: { category: "회식", done: true, title: "3월 친목 도모 회식", responded: 12 },
};

export const 카테고리별: Story = {
  render: () => (
    <div className="grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <MeetingCard category="모임" done={false} title="2026 봄학기 신입 환영회" date="2026.04.20 (토) 18:00" location="학교 후문 OO치킨 2층" responded={16} capacity={15} />
      <MeetingCard category="MT" done={false} title="여름 워크샵 1박 2일 MT" date="2026.06.15 (월) 09:00" location="가평 OO펜션 전관" responded={12} capacity={15} />
      <MeetingCard category="회식" done title="3월 친목 도모 회식" date="2026.03.28 (금) 19:00" location="종강 펌 본점" responded={12} capacity={15} />
    </div>
  ),
};
