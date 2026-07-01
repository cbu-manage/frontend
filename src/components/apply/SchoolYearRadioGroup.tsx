"use client";

import React from "react";

const OPTIONS = [
  "1학년",
  "2학년",
  "3학년",
  "4학년",
  "휴학생",
  "졸업생",
] as const;
const DIVIDER_AFTER = "4학년";

interface SchoolYearRadioGroupProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SchoolYearRadioGroup({
  value,
  onChange,
}: SchoolYearRadioGroupProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-body-sm font-medium text-gray-900">
        학년 <span className="text-notice">*</span>
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {OPTIONS.map((option) => (
          <React.Fragment key={option}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="schoolYear"
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              <span
                className={`flex items-center justify-center w-4 h-4 rounded-full border-2 transition-colors duration-150 ${
                  value === option ? "border-brand" : "border-gray-300"
                }`}
              >
                {value === option && (
                  <span className="w-2 h-2 rounded-full bg-brand block" />
                )}
              </span>
              <span className="text-body-sm text-gray-900">{option}</span>
            </label>
            {option === DIVIDER_AFTER && (
              <div className="w-px h-4 bg-gray-300" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
