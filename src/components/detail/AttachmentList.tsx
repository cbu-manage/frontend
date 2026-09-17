"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Paperclip, Download, Trash2 } from "lucide-react";
import { newsApi, type NewsAttachment } from "@/api";
import { useCan } from "@/hooks/auth";

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

type AttachmentListProps = {
  newsId: number;
  attachments: NewsAttachment[];
};

/**
 * 소식·뉴스레터 상세의 첨부 목록. 다운로드는 서버가 준 URL 로 새 창, 삭제는 소식 관리 권한만.
 * 삭제 뒤 상세 쿼리(["news", id])를 무효화해 목록이 바로 줄어든다.
 */
export default function AttachmentList({
  newsId,
  attachments,
}: AttachmentListProps) {
  const queryClient = useQueryClient();
  const canManage = useCan("news.manage");
  const [busyId, setBusyId] = useState<number | null>(null);

  if (attachments.length === 0) return null;

  const handleDownload = async (a: NewsAttachment) => {
    setBusyId(a.attachmentId);
    try {
      const res = await newsApi.downloadAttachment(newsId, a.attachmentId);
      const url = res.data.data?.url;
      if (!url) throw new Error("no url");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      window.alert("파일을 내려받지 못했습니다. 다시 시도해주세요.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (a: NewsAttachment) => {
    if (!window.confirm(`「${a.fileName}」 첨부를 삭제할까요?`)) return;
    setBusyId(a.attachmentId);
    try {
      await newsApi.deleteAttachment(newsId, a.attachmentId);
      await queryClient.invalidateQueries({ queryKey: ["news", newsId] });
    } catch {
      window.alert("첨부 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mt-8">
      <p className="mb-2 flex items-center gap-1.5 text-body-sm text-gray-500">
        <Paperclip size={14} /> 첨부파일 {attachments.length}
      </p>
      <ul className="flex flex-col gap-2">
        {attachments.map((a) => {
          const busy = busyId === a.attachmentId;
          return (
            <li
              key={a.attachmentId}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-2.5 text-sm"
            >
              <button
                type="button"
                onClick={() => handleDownload(a)}
                disabled={busy}
                className="flex min-w-0 flex-1 items-center gap-2 text-left text-gray-900 hover:underline disabled:opacity-50"
              >
                <Download size={14} className="shrink-0 text-gray-500" />
                <span className="truncate">{a.fileName}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatSize(a.fileSize)}
                </span>
              </button>
              {canManage && (
                <button
                  type="button"
                  onClick={() => handleDelete(a)}
                  disabled={busy}
                  aria-label={`${a.fileName} 삭제`}
                  className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
