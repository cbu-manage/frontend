import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Mascot from "./Mascot";

/**
 * 씨부엉 마스코트 (인라인 SVG). 감정(default/heart) × 사이즈(sm/md/lg). (Figma: Component/Mascot)
 */
const meta = {
  title: "Common/Mascot",
  component: Mascot,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof Mascot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Emotions: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <Mascot emotion="default" size="lg" />
      <Mascot emotion="heart" size="lg" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <Mascot size="sm" />
      <Mascot size="md" />
      <Mascot size="lg" />
    </div>
  ),
};
