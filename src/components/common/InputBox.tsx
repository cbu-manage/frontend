"use client";
import React from "react";

interface InputBoxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 에러 메시지 (있으면 error 상태 + 하단 안내 문구 노출) */
  errorMessage?: string;
  /** 성공 상태 여부 (체크 아이콘 노출) */
  success?: boolean;
  /** 상단 라벨 텍스트 (선택) */
  label?: string;
  /** 우측에 표시할 커스텀 요소 (예: 비밀번호 표시/숨김 버튼) */
  rightElement?: React.ReactNode;
  /** inset label 스타일 (Material Design) */
  insetLabel?: string;
}

/**
 * 로그인·회원가입 플로우에서 사용하는 공통 인풋 박스
 *
 * 상태
 * - default   : 회색 테두리, 흰 배경
 * - focus     : 브랜드 색상 테두리 + 아웃라인
 * - filled    : 값이 있어도 스타일은 default / focus 규칙 따름
 * - error     : 빨간 테두리 + 에러 메시지
 * - disabled  : 연한 회색 배경 + 텍스트/플레이스홀더 흐리게
 * - success   : 오른쪽에 초록 체크 아이콘 표시
 */
export default function InputBox({
  label,
  errorMessage,
  success = false,
  disabled,
  className = "",
  rightElement,
  insetLabel,
  ...props
}: InputBoxProps) {
  const hasError = errorMessage !== undefined && errorMessage !== null;
  const hasRightElement = !!rightElement;
  const isInset = !!insetLabel;

  // inset label 모드
  if (isInset) {
    return (
      <div className="relative w-full">
        <input
          {...props}
          disabled={disabled}
          placeholder=" "
          className={`
            peer w-full rounded-lg p-4 pt-6 text-base font-medium tracking-[-0.048px] leading-normal outline-none transition-all duration-150 border
            ${
              disabled
                ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed placeholder:text-gray-400"
                : hasError
                ? "bg-gray-0 text-gray-600 placeholder:text-gray-600"
                : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-transparent focus:bg-gray-0 focus:border-brand focus:ring-1 focus:ring-brand"
            }
            ${hasRightElement ? "pr-12" : ""}
            ${className}
          `.trim()}
          style={{
            borderColor: hasError ? "#ff4e4e" : undefined,
          }}
        />
        
        {/* Inset Label */}
        <label className="absolute left-4 top-2 text-xs font-medium text-gray-500 pointer-events-none transition-all duration-150 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-600 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-gray-500 has-[:not(:placeholder-shown)]:top-2 has-[:not(:placeholder-shown)]:text-xs">
          {insetLabel}
        </label>

        {/* 우측 커스텀 요소 */}
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}

        {/* 성공 체크 아이콘 */}
        {!disabled && success && !hasError && !hasRightElement && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3.25-3.25a1 1 0 1 1 1.414-1.414L8.5 11.836l6.543-6.543a1 1 0 0 1 1.414 0Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </div>
    );
  }

  // 기존 label 모드
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-900">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          disabled={disabled}
          className={`
            w-full rounded-lg p-4 text-base font-medium tracking-[-0.048px] leading-normal outline-none transition-all duration-150 border
            ${
              disabled
                ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed placeholder:text-gray-400"
                : hasError
                ? "bg-gray-0 text-gray-600 placeholder:text-gray-600"
                : "bg-gray-50 border-transparent text-gray-900 placeholder:text-gray-600 focus:bg-gray-0 focus:border-brand focus:ring-1 focus:ring-brand"
            }
            ${hasRightElement ? "pr-12" : ""}
            ${className}
          `.trim()}
          style={{
            borderColor: hasError ? "#ff4e4e" : undefined,
          }}
        />

        {/* 우측 커스텀 요소 (비밀번호 표시/숨김 버튼 등) */}
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}

        {/* 성공 체크 아이콘 (rightElement가 없을 때만 표시) */}
        {!disabled && success && !hasError && !hasRightElement && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3.25-3.25a1 1 0 1 1 1.414-1.414L8.5 11.836l6.543-6.543a1 1 0 0 1 1.414 0Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </div>

      {/* 에러 메시지 */}
      {hasError && errorMessage && (
        <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "#ff4e4e" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M5.41667 8.125C5.57014 8.125 5.69878 8.07309 5.8026 7.96927C5.90642 7.86545 5.95833 7.7368 5.95833 7.58333C5.95833 7.42986 5.90642 7.30121 5.8026 7.1974C5.69878 7.09358 5.57014 7.04167 5.41667 7.04167C5.26319 7.04167 5.13455 7.09358 5.03073 7.1974C4.92691 7.30121 4.875 7.42986 4.875 7.58333C4.875 7.7368 4.92691 7.86545 5.03073 7.96927C5.13455 8.07309 5.26319 8.125 5.41667 8.125ZM4.875 5.95833H5.95833V2.70833H4.875V5.95833ZM5.41667 10.8333C4.66736 10.8333 3.96319 10.6911 3.30417 10.4068C2.64514 10.1224 2.07187 9.73646 1.58437 9.24896C1.09687 8.76146 0.710937 8.18819 0.426562 7.52917C0.142187 6.87014 0 6.16597 0 5.41667C0 4.66736 0.142187 3.96319 0.426562 3.30417C0.710937 2.64514 1.09687 2.07187 1.58437 1.58437C2.07187 1.09687 2.64514 0.710937 3.30417 0.426562C3.96319 0.142187 4.66736 0 5.41667 0C6.16597 0 6.87014 0.142187 7.52917 0.426562C8.18819 0.710937 8.76146 1.09687 9.24896 1.58437C9.73646 2.07187 10.1224 2.64514 10.4068 3.30417C10.6911 3.96319 10.8333 4.66736 10.8333 5.41667C10.8333 6.16597 10.6911 6.87014 10.4068 7.52917C10.1224 8.18819 9.73646 8.76146 9.24896 9.24896C8.76146 9.73646 8.18819 10.1224 7.52917 10.4068C6.87014 10.6911 6.16597 10.8333 5.41667 10.8333ZM5.41667 9.75C6.62639 9.75 7.65104 9.33021 8.49062 8.49062C9.33021 7.65104 9.75 6.62639 9.75 5.41667C9.75 4.20694 9.33021 3.18229 8.49062 2.34271C7.65104 1.50312 6.62639 1.08333 5.41667 1.08333C4.20694 1.08333 3.18229 1.50312 2.34271 2.34271C1.50312 3.18229 1.08333 4.20694 1.08333 5.41667C1.08333 6.62639 1.50312 7.65104 2.34271 8.49062C3.18229 9.33021 4.20694 9.75 5.41667 9.75Z"
              fill="#FF4E4E"
            />
          </svg>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
