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
}

export default function Toggle({
  label,
  options,
  value,
  onChange,
  className = "",
}: ToggleProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-800 mb-2">
          {label}
        </label>
      )}

      <div className="inline-flex rounded-full bg-gray-100 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
              ${value === option.value
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
