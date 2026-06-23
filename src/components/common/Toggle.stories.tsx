import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import Toggle from "./Toggle";

const meta = {
  title: "Common/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "세그먼트 토글 (Figma: toggle). 선택된 옵션은 흰 배경, 나머지는 회색. 모집 중/완료 같은 양자택일에 사용.",
      },
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

const OPTIONS = [
  { label: "모집 중", value: "open" },
  { label: "모집 완료", value: "closed" },
];

// 훅은 대문자 컴포넌트 안에서만 호출 가능 — render 화살표함수에서 직접 호출 시 rules-of-hooks 위반
function ToggleDefaultStory() {
  const [value, setValue] = useState("open");
  return <Toggle options={OPTIONS} value={value} onChange={setValue} />;
}

function ToggleWithLabelStory() {
  const [value, setValue] = useState("open");
  return (
    <Toggle label="모집 상태" options={OPTIONS} value={value} onChange={setValue} size="md" />
  );
}

export const Default: Story = {
  render: () => <ToggleDefaultStory />,
};

export const WithLabel: Story = {
  render: () => <ToggleWithLabelStory />,
};
