"use client";

import { useState } from "react";
import { Eye, FileText } from "lucide-react";

/** 링크에서 도메인 추출 후 Google Favicon URL 반환 (썸네일 없을 때 대체) */
function getFaviconUrl(link: string): string {
  try {
    const url = new URL(link);
    const domain = url.hostname.replace(/^www\./, "");
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  } catch {
    return "";
  }
}

interface ArchiveCardProps {
  id: string;
  title: string;
  link?: string;
  /** 썸네일 이미지 URL (API에서 og:image 등으로 채울 수 있음) */
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  views?: number;
  likes?: number;
}

export default function ArchiveCard({
  id,
  title,
  link,
  thumbnailUrl,
  uploadedBy,
  uploadedAt,
  views = 0,
}: ArchiveCardProps) {
  const effectiveThumbnail =
    thumbnailUrl || (link ? getFaviconUrl(link) : null);
  const [thumbFailed, setThumbFailed] = useState(false);
  const showThumb = effectiveThumbnail && !thumbFailed;

  const content = (
    <>
      {/* 썸네일 영역: API 썸네일 → 링크 도메인 favicon → 기본 아이콘 */}
      <div className="w-full aspect-video bg-gray-200 overflow-hidden">
        {showThumb ? (
          <img
            src={effectiveThumbnail!}
            alt={title}
            className={`w-full h-full ${thumbnailUrl ? "object-cover" : "object-contain p-8"}`}
            onError={() => setThumbFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <FileText size={40} />
          </div>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-4 flex flex-col gap-3 flex-1 grow">
        {/* 제목 */}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
          {title}
        </h3>
      </div>

      {/* 푸터 영역 */}
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-xs text-gray-700 font-medium truncate">
            {uploadedBy}
          </span>
          <span className="text-xs text-gray-400">{uploadedAt}</span>
        </div>
        <div className="flex gap-2 text-xs text-gray-500 shrink-0">
          {views > 0 && (
            <span className="flex items-center gap-1">
              <Eye size={16} />
              {views}
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col h-full">
      {content}
    </div>
  );
}
