import React from "react";

interface OutlineBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/**
 * 로그인·회원가입 플로우에서 사용하는 아웃라인 버튼
 * - Default: 흰색 배경, 회색 테두리, 회색 텍스트
 * - Hover/Click: 연한 회색 배경, 진한 텍스트
 */
export default function OutlineBtn({
  children,
  disabled,
  className = "",
  ...props
}: OutlineBtnProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        rounded-lg px-2 py-1 text-base font-medium
        transition-all duration-200 border
        ${
          disabled
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gray-0 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
        }
        ${className}
      `.trim()}
    >
      {children}
    </button>
  );
}
