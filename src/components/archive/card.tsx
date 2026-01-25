'use client';

import { Eye, FileText } from 'lucide-react';

interface ArchiveCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  views?: number;
  likes?: number;
}

export default function ArchiveCard({
  id,
  title,
  thumbnailUrl,
  uploadedBy,
  uploadedAt,
  views = 0,
}: ArchiveCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col h-full">
      {/* 썸네일 영역 */}
      <div className="w-full aspect-video bg-gray-200 overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <FileText size={40} />
          </div>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-4 flex flex-col gap-3 flex-1 flex-grow">
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
        <div className="flex gap-2 text-xs text-gray-500 flex-shrink-0">
          {views > 0 && (
            <span className="flex items-center gap-1">
              <Eye size={16} />
              {views}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
