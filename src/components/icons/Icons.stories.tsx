import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Search,
  Eye,
  Clock,
  ChevronDown,
  X,
  FileText,
  MessageCircle,
  UserCircle,
  Bell,
  Calendar,
  Download,
  Menu,
} from "lucide-react";
import { PersonIcon } from "./PersonIcon";

/**
 * 아이콘 컨벤션 — 기본은 lucide-react, 커스텀은 PersonIcon만.
 * (Figma: Component/icon · icon_round) 신규 SVG 아이콘이 필요하면 lucide에 없을 때만 자체 추가.
 */
const meta = {
  title: "Common/Icons",
  component: PersonIcon,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof PersonIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

const LUCIDE = [
  { name: "Search", Icon: Search },
  { name: "Eye", Icon: Eye },
  { name: "Clock", Icon: Clock },
  { name: "ChevronDown", Icon: ChevronDown },
  { name: "X", Icon: X },
  { name: "FileText", Icon: FileText },
  { name: "MessageCircle", Icon: MessageCircle },
  { name: "UserCircle", Icon: UserCircle },
  { name: "Bell", Icon: Bell },
  { name: "Calendar", Icon: Calendar },
  { name: "Download", Icon: Download },
  { name: "Menu", Icon: Menu },
];

export const Showcase: Story = {
  render: () => (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        아이콘 기본 = <code>lucide-react</code>. 자체 SVG는 lucide에 없을 때만 추가.
      </p>
      <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
        {LUCIDE.map(({ name, Icon }) => (
          <div
            key={name}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-3 text-gray-700"
          >
            <Icon className="size-6" />
            <span className="text-xs text-gray-500">{name}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2 rounded-lg border border-brand/40 bg-brand/5 p-3 text-gray-700">
          <PersonIcon size={24} />
          <span className="text-xs text-brand">PersonIcon*</span>
        </div>
      </div>
      <p className="text-xs text-gray-400">* 자체 커스텀 아이콘</p>
    </div>
  ),
};
