"use client";

import { Paperclip, Monitor } from "lucide-react";

type FileUploadBoxProps = {
  /** 현재 선택된 파일 목록 (부모가 상태 보유) */
  files: File[];
  /** 파일 변경 시 호출 */
  onChange: (files: File[]) => void;
  /** 여러 파일 허용 (기본 false = 1장만, 새로 고르면 교체) */
  multiple?: boolean;
  /** input accept 힌트 (예: "image/*") */
  accept?: string;
  /** 이미지 파일만 허용 (드래그&드롭 포함 모든 경로에서 타입 검증) */
  imageOnly?: boolean;
  /** 안내 문구 */
  hint?: string;
};

function formatSize(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

/**
 * 파일 첨부 박스 (드래그&드롭 + 버튼 선택 + 목록/제거).
 * report 작성 페이지의 동작 구조를 공용화한 컴포넌트.
 */
export default function FileUploadBox({
  files,
  onChange,
  multiple = false,
  accept,
  imageOnly = false,
  hint = "버튼 선택 또는 첨부파일을 선택하여 이곳에 드래그&드롭해 주세요.",
}: FileUploadBoxProps) {
  const addFiles = (picked: FileList | null) => {
    if (!picked || picked.length === 0) return;
    let list = Array.from(picked);
    if (imageOnly) {
      const images = list.filter((f) => f.type.startsWith("image/"));
      if (images.length < list.length) alert("이미지 파일만 첨부할 수 있습니다.");
      list = images;
      if (list.length === 0) return;
    }
    // 단일 모드면 교체, 다중 모드면 기존에 추가
    onChange(multiple ? [...files, ...list] : [list[0]]);
  };

  const removeAt = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {/* 드롭 존 — 다중이면 항상, 단일이면 비었을 때만 노출 */}
      {(multiple || files.length === 0) && (
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
          className="flex items-center justify-between gap-3 border border-dashed border-gray-300 rounded-lg px-3 h-11 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 text-gray-400">
              <Paperclip size={13} />
            </span>
            <span className="text-sm text-gray-400 truncate">{hint}</span>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-300 text-xs font-medium text-gray-600">
            <Monitor size={13} /> 내 컴퓨터 찾기
          </span>
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
          />
        </label>
      )}

      {/* 선택된 파일 목록 */}
      {files.map((file, i) => (
        <div
          key={`${file.name}-${file.size}-${i}`}
          className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 rounded-lg px-3 h-11 border border-gray-200"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 px-2 py-0.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700">
              {file.type.startsWith("image/") ? "사진" : "파일"}
            </span>
            <span className="truncate">{file.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <span className="text-xs text-gray-400">{formatSize(file.size)}</span>
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              × 제거
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
