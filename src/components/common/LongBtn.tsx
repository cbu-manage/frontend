import React from "react";

interface LongBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function LongBtn({ children, disabled, className = "", ...props }: LongBtnProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        w-full rounded-lg p-4 font-semibold text-white
        transition-all duration-200
        ${
          disabled
            ? "bg-gray-300 cursor-not-allowed text-gray-500"
            : "bg-brand hover:opacity-90 active:opacity-80"
        }
        ${className}
      `.trim()}
    >
      {children}
    </button>
  );
}
