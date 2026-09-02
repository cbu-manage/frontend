"use client";

import InputBox from "@/components/common/InputBox";

const HOW_FOUND_OPTIONS = [
  "에브리타임",
  "인스타그램",
  "지인추천",
  "기타",
] as const;

interface HowFoundRadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  /** "기타" 선택 시 직접 입력하는 상세 값 */
  etcValue?: string;
  onEtcChange?: (value: string) => void;
}

export default function HowFoundRadioGroup({
  value,
  onChange,
  etcValue = "",
  onEtcChange,
}: HowFoundRadioGroupProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-body-sm font-medium text-gray-900">
        유입 경로 <span className="text-notice">*</span>
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {HOW_FOUND_OPTIONS.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name="howFound"
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only peer"
            />
            <span
              className={`flex items-center justify-center w-4 h-4 rounded-full border-2 transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-1 ${
                value === option ? "border-brand" : "border-gray-300"
              }`}
            >
              {value === option && (
                <span className="w-2 h-2 rounded-full bg-brand block" />
              )}
            </span>
            <span className="text-base text-gray-900">{option}</span>
          </label>
        ))}
      </div>
      {value === "기타" && onEtcChange && (
        <div className="mt-2">
          <InputBox
            variant="outline"
            aria-label="기타 유입 경로 상세"
            value={etcValue}
            onChange={(e) => onEtcChange(e.target.value)}
            placeholder="어떻게 알게 되셨는지 알려주세요"
          />
        </div>
      )}
    </div>
  );
}
