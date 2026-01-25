// src/components/shared/Pagination.tsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number[];
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages[totalPages.length - 1];

  return (
    <div className="flex justify-center items-center gap-1 mt-16 pb-8">
      {/* 이전 페이지 버튼 */}
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={isFirstPage}
        className={`p-2 rounded-lg transition-all ${
          isFirstPage
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <ChevronLeft size={20} />
      </button>
      
      {/* 페이지 번호 목록 */}
      {totalPages.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
            currentPage === num
              ? 'bg-brand text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {num}
        </button>
      ))}

      {/* 다음 페이지 버튼 */}
      <button 
        onClick={() => onPageChange(Math.min(totalPages[totalPages.length - 1], currentPage + 1))}
        disabled={isLastPage}
        className={`p-2 rounded-lg transition-all ${
          isLastPage
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}