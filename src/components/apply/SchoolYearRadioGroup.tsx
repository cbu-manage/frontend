"use client";

const SCHOOL_YEARS = [
  "1학년",
  "2학년",
  "3학년",
  "4학년",
  "휴학생",
  "졸업생",
] as const;

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
      <p className="text-sm font-medium text-gray-900">
        학년 <span className="text-notice">*</span>
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {SCHOOL_YEARS.map((year) => (
          <label key={year} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="schoolYear"
              value={year}
              checked={value === year}
              onChange={() => onChange(year)}
              className="sr-only"
            />
            <span
              className={`flex items-center justify-center w-4 h-4 rounded-full border-2 transition-colors duration-150 ${
                value === year ? "border-brand" : "border-gray-300"
              }`}
            >
              {value === year && (
                <span className="w-2 h-2 rounded-full bg-brand block" />
              )}
            </span>
            <span className="text-sm text-gray-900">{year}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
