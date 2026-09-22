import type { Preview } from "@storybook/nextjs-vite";

// 프로젝트 디자인 토큰·타이포·Pretendard 폰트 로드 (gray/brand/success/danger 등)
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "app",
      values: [
        { name: "app", value: "#f5f6f8" },
        { name: "white", value: "#ffffff" },
      ],
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      test: "todo",
    },
  },
};

export default preview;
