"use client";

interface AttendanceRadioGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export default function AttendanceRadioGroup({
  label,
  name,
  value,
  onChange,
}: AttendanceRadioGroupProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-body-sm font-medium text-gray-900">
        {label} <span className="text-notice">*</span>
      </p>
      <div className="flex gap-6">
        {["가능", "불가능"].map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name={name}
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
        ))}
      </div>
    </div>
  );
}
