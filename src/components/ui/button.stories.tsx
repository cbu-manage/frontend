import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";

/**
 * 통합 Button — cva 기반 단일 버튼. 기존 LongBtn/ShortBtn/OutlineBtn을 이걸로 수렴.
 * - variant: brand(올리브, 기존 LongBtn) · default(다크, 기존 ShortBtn) · outline(기존 OutlineBtn)
 *   · secondary · ghost · link · destructive
 * - size: default · xs · sm · lg · icon(정사각)
 * - full-width는 size가 아니라 className="w-full" (기존 LongBtn 역할)
 */
const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "brand",
        "default",
        "outline",
        "secondary",
        "ghost",
        "link",
        "destructive",
      ],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon"],
    },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
  args: {
    variant: "brand",
    size: "default",
    children: "버튼",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 컨트롤 패널에서 variant/size/disabled를 직접 바꿔보는 인터랙티브 스토리 */
export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="brand">brand</Button>
      <Button variant="default">default</Button>
      <Button variant="outline">outline</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="ghost">ghost</Button>
      <Button variant="link">link</Button>
      <Button variant="destructive">destructive</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="brand" size="xs">
        xs
      </Button>
      <Button variant="brand" size="sm">
        sm
      </Button>
      <Button variant="brand" size="default">
        default
      </Button>
      <Button variant="brand" size="lg">
        lg
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="brand" disabled>
        brand
      </Button>
      <Button variant="default" disabled>
        default
      </Button>
      <Button variant="outline" disabled>
        outline
      </Button>
    </div>
  ),
};

/** 기존 LongBtn 역할 — full-width 브랜드 버튼 (제출 플로우) */
export const FullWidthBrand: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Button variant="brand" className="w-full">
        제출하기
      </Button>
      <Button variant="brand" className="w-full" disabled>
        제출하기 (disabled)
      </Button>
    </div>
  ),
};
