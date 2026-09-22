import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";

/**
 * 공통 모달 래퍼. 오버레이 + 닫기 + 제목/푸터 슬롯. (Figma: Component/팝)
 */
const meta = {
  title: "Common/Modal",
  component: Modal,
  tags: ["autodocs"],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

function ModalDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex h-64 items-center justify-center">
      <Button variant="brand" onClick={() => setOpen(true)}>
        모달 열기
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="제출 확인"
        footer={
          <Button
            variant="brand"
            className="w-full h-auto rounded-lg p-4 text-base font-semibold"
            onClick={() => setOpen(false)}
          >
            제출한 서류 확인하기
          </Button>
        }
      >
        <p className="text-base leading-relaxed text-gray-600">
          입력한 내용을 수정하고 싶다면 입력해주세요!
        </p>
      </Modal>
    </div>
  );
}

export const Default: Story = {
  render: () => <ModalDemo />,
};
