"use client";

import { useRef, useState } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { HelpCircle } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface MarkdownCodeProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  className?: string;
}

// 코딩테스트 글 작성용 마크다운 에디터
export default function MarkdownEditor({
  value,
  onChange,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const applyWrap = (before: string, after: string) => {
    const el = textareaRef.current;
    if (!el) {
      onChange(`${value}${before}${after}`);
      return;
    }
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.slice(start, end);
    const next =
      value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
  };

  const insertCodeBlock = () => {
    const el = textareaRef.current;
    const codeTemplate = "\n```python\n# 여기에 코드를 작성하세요\n```\n";
    if (!el) {
      onChange(value + codeTemplate);
      return;
    }
    const pos = el.selectionStart ?? value.length;
    const next = value.slice(0, pos) + codeTemplate + value.slice(pos);
    onChange(next);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* 툴바 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-700">
        {/* 포맷팅 버튼 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="px-2 py-1 rounded hover:bg-gray-100"
            onClick={() => applyWrap("**", "**")}
          >
            굵게
          </button>
          <button
            type="button"
            className="px-2 py-1 rounded hover:bg-gray-100"
            onClick={() => applyWrap("`", "`")}
          >
            인라인 코드
          </button>
          <button
            type="button"
            className="px-2 py-1 rounded hover:bg-gray-100"
            onClick={insertCodeBlock}
          >
            코드 블록 추가
          </button>
        </div>

        <span className="ml-3 text-[11px] text-gray-400 hidden sm:inline">
          Markdown 지원 (예: ``` ``` 로 코드 블록)
        </span>

        {/* 마크다운 도움말 버튼 */}
        <button
          type="button"
          aria-label="마크다운 문법 도움말"
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hidden sm:inline"
          onClick={() =>
            window.open(
              "https://www.markdownguide.org/basic-syntax/",
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        {/* 편집 / 미리보기 전환 탭 */}
        <div className="ml-auto inline-flex items-center rounded-full bg-gray-100 p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`px-3 py-1 rounded-full ${
              mode === "edit"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            편집
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`px-3 py-1 rounded-full ${
              mode === "preview"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            미리보기
          </button>
        </div>
      </div>

      {/* 편집 / 미리보기 영역 */}
      {mode === "edit" ? (
        <div className="border-t border-gray-200">
          <textarea
            ref={textareaRef}
            placeholder="풀이 아이디어, 코드, 메모 등을 마크다운 형식으로 작성해 주세요."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={18}
            className="
              w-full px-4 py-3 text-sm
              bg-white border-none outline-none
              placeholder:text-gray-400
              resize-none
            "
          />
        </div>
      ) : (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-0 max-h-[480px] overflow-y-auto">
          <p className="text-xs text-gray-400 mb-2">미리보기</p>
          {value.trim() ? (
            <div className="max-w-none text-sm leading-relaxed space-y-3">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  h1: (props) => (
                    <h1
                      className="mt-4 mb-2 text-2xl font-bold text-gray-900"
                      {...props}
                    />
                  ),
                  h2: (props) => (
                    <h2
                      className="mt-4 mb-2 text-xl font-semibold text-gray-900"
                      {...props}
                    />
                  ),
                  h3: (props) => (
                    <h3
                      className="mt-4 mb-2 text-lg font-semibold text-gray-900"
                      {...props}
                    />
                  ),
                  p: (props) => (
                    <p
                      className="mb-3 text-gray-800 leading-relaxed"
                      {...props}
                    />
                  ),
                  li: (props) => (
                    <li
                      className="ml-4 list-disc text-gray-800 mb-1 leading-relaxed"
                      {...props}
                    />
                  ),
                  code: ({ children, className }: MarkdownCodeProps) => {
                    const codeText = String(children ?? "").replace(/\n$/, "");
                    const isCodeBlock =
                      typeof className === "string" &&
                      className.includes("language-");

                    if (!isCodeBlock) {
                      // 인라인 코드는 살짝만 강조 (배경 없이, 모노스페이스만)
                      return (
                        <code className="font-mono text-[12px] text-gray-800">
                          {codeText}
                        </code>
                      );
                    }

                    // ```lang ... ``` 처럼 언어가 지정된 코드 블록만 박스로 렌더링
                    return (
                      <pre className="mt-2 mb-3 rounded-lg bg-[#111827] text-gray-50 text-[12px] leading-relaxed overflow-x-auto p-4 font-mono">
                        <code className={className}>{codeText}</code>
                      </pre>
                    );
                  },
                }}
              >
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              작성 중인 마크다운이 여기에서 어떻게 보이는지 미리 확인할 수
              있습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
