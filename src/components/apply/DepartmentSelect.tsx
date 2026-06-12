"use client";

const DEPARTMENTS = [
  "컴퓨터공학전공",
  "소프트웨어전공",
  "게임공학과",
  "인공지능학과",
  "전자공학전공",
  "임베디드시스템전공",
  "나노반도체공학전공",
  "반도체시스템전공",
  "기계공학과",
  "기계설계전공",
  "지능형모빌리티전공",
  "메카트로닉스전공",
  "AI로봇전공",
  "신소재공학과",
  "생명화학공학과",
  "전력응용시스템전공",
  "미래에너지시스템전공",
  "경영학전공",
  "IT경영전공",
  "데이터사이언스경영전공",
  "산업디자인공학전공",
  "미디어디자인공학전공",
  "자율전공",
  "계약학과"
];

interface DepartmentSelectProps {
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
}

export default function DepartmentSelect({
  value,
  onChange,
  errorMessage,
}: DepartmentSelectProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-gray-900">
        학과 <span className="text-notice">*</span>
      </p>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-lg px-4 py-4 text-base font-medium tracking-[-0.048px] leading-normal border text-gray-900 outline-none transition-all duration-150 cursor-pointer ${
            errorMessage
              ? "border-notice bg-gray-0"
              : "border-transparent bg-gray-50 focus:bg-gray-0 focus:border-brand focus:ring-1 focus:ring-brand"
          }`}
          style={{ color: value === "" ? "#959aa3" : undefined }}
        >
          <option value="" disabled>
            학과 선택
          </option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {errorMessage && (
        <p className="text-xs text-notice flex items-center gap-1 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" className="shrink-0">
            <path d="M5.41667 8.125C5.57014 8.125 5.69878 8.07309 5.8026 7.96927C5.90642 7.86545 5.95833 7.7368 5.95833 7.58333C5.95833 7.42986 5.90642 7.30121 5.8026 7.1974C5.69878 7.09358 5.57014 7.04167 5.41667 7.04167C5.26319 7.04167 5.13455 7.09358 5.03073 7.1974C4.92691 7.30121 4.875 7.42986 4.875 7.58333C4.875 7.7368 4.92691 7.86545 5.03073 7.96927C5.13455 8.07309 5.26319 8.125 5.41667 8.125ZM4.875 5.95833H5.95833V2.70833H4.875V5.95833ZM5.41667 10.8333C4.66736 10.8333 3.96319 10.6911 3.30417 10.4068C2.64514 10.1224 2.07187 9.73646 1.58437 9.24896C1.09687 8.76146 0.710937 8.18819 0.426562 7.52917C0.142187 6.87014 0 6.16597 0 5.41667C0 4.66736 0.142187 3.96319 0.426562 3.30417C0.710937 2.64514 1.09687 2.07187 1.58437 1.58437C2.07187 1.09687 2.64514 0.710937 3.30417 0.426562C3.96319 0.142187 4.66736 0 5.41667 0C6.16597 0 6.87014 0.142187 7.52917 0.426562C8.18819 0.710937 8.76146 1.09687 9.24896 1.58437C9.73646 2.07187 10.1224 2.64514 10.4068 3.30417C10.6911 3.96319 10.8333 4.66736 10.8333 5.41667C10.8333 6.16597 10.6911 6.87014 10.4068 7.52917C10.1224 8.18819 9.73646 8.76146 9.24896 9.24896C8.76146 9.73646 8.18819 10.1224 7.52917 10.4068C6.87014 10.6911 6.16597 10.8333 5.41667 10.8333ZM5.41667 9.75C6.62639 9.75 7.65104 9.33021 8.49062 8.49062C9.33021 7.65104 9.75 6.62639 9.75 5.41667C9.75 4.20694 9.33021 3.18229 8.49062 2.34271C7.65104 1.50312 6.62639 1.08333 5.41667 1.08333C4.20694 1.08333 3.18229 1.50312 2.34271 2.34271C1.50312 3.18229 1.08333 4.20694 1.08333 5.41667C1.08333 6.62639 1.50312 7.65104 2.34271 8.49062C3.18229 9.33021 4.20694 9.75 5.41667 9.75Z" fill="#FF4E4E" />
          </svg>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
