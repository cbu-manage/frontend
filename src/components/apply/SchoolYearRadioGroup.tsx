"use client";

const YEARS = ["1학년", "2학년", "3학년", "4학년"] as const;
const STATUSES = ["휴학생", "졸업생"] as const;

interface SchoolYearRadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  statuses: string[];
  onStatusChange: (statuses: string[]) => void;
}

export default function SchoolYearRadioGroup({
  value,
  onChange,
  statuses,
  onStatusChange,
}: SchoolYearRadioGroupProps) {
  const toggleStatus = (status: string) => {
    onStatusChange(statuses.includes(status) ? [] : [status]);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-body-sm font-medium text-gray-900">
        학년 <span className="text-notice">*</span>
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {YEARS.map((year) => (
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
            <span className="text-body-sm text-gray-900">{year}</span>
          </label>
        ))}

        <div className="w-6" />
        {STATUSES.map((status) => (
          <label
            key={status}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={statuses.includes(status)}
              onChange={() => toggleStatus(status)}
              className="sr-only"
            />
            <span
              className={`flex items-center justify-center w-4 h-4 rounded border-2 transition-colors duration-150 ${
                statuses.includes(status)
                  ? "border-brand bg-brand"
                  : "border-gray-300 bg-white"
              }`}
            >
              {statuses.includes(status) && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 3.5L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className="text-body-sm text-gray-900">{status}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
