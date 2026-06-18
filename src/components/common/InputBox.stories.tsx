import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import InputBox from "./InputBox";

const meta = {
  title: "Common/InputBox",
  component: InputBox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "폼 공통 인풋 (Figma: input box_type 2). default/focus/filled/error/disabled/success 상태 + inset label 모드.",
      },
    },
  },
  args: { label: "이름", placeholder: "이름을 입력해 주세요" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: "씨부엉" } };
export const Success: Story = { args: { defaultValue: "씨부엉", success: true } };
export const Error: Story = {
  args: { defaultValue: "씨", errorMessage: "이름을 정확히 입력해 주세요" },
};
export const Disabled: Story = { args: { defaultValue: "씨부엉", disabled: true } };
export const InsetLabel: Story = {
  args: { label: undefined, insetLabel: "이름", defaultValue: "씨부엉" },
};
