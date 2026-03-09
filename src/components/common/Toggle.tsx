"use client";

import React from "react";

interface ToggleOption {
  label: string;
  value: string;
}

interface ToggleProps {
  label?: string;
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "base" | "md";
}

const SIZE_MAP = {
  sm: {
    text: "text-sm",
    btn: "px-4 py-2",
    wrap: "p-1",
    label: "text-sm",
  },
  base: {
    text: "text-[14px]",
    btn: "px-4 py-[9px]",
    wrap: "p-1",
    label: "text-sm",
  },
  md: {
    text: "text-base",
    btn: "px-5 py-2.5",
    wrap: "p-1.5",
    label: "text-base",
  },
} as const;

export default function Toggle({
  label,
  options,
  value,
  onChange,
  className = "",
  size = "sm",
}: ToggleProps) {
  const s = SIZE_MAP[size];

  return (
    <div className={className}>
      {label && (
        <label className={`block font-medium text-gray-800 mb-2 ${s.label}`}>
          {label}
        </label>
      )}

      <div className={`inline-flex rounded-full bg-gray-100 ${s.wrap}`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              ${s.btn} ${s.text} font-medium rounded-full transition-all duration-200
              ${
                value === option.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
