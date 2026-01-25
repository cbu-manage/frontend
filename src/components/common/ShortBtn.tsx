import React from "react";

interface ShortBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/**
 * 로그인 플로우에서 사용하는 짧은 검정 버튼
 * - Default: 검정 배경, 흰색 텍스트
 * - Disabled: 연한 회색 배경, 회색 텍스트
 * - Hover: 살짝 더 밝은 검정/회색으로 변경
 */
export default function ShortBtn({
  children,
  disabled,
  className = "",
  ...props
}: ShortBtnProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        rounded-lg px-8 py-4 text-base font-medium
        transition-colors duration-200
        ${
          disabled
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-gray-800 text-gray-0"
        }
        ${className}
      `.trim()}
    >
      {children}
    </button>
  );
}

