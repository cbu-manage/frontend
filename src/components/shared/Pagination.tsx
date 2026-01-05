// src/components/shared/Pagination.tsx
'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number[];
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      {/* [자바스크립트 문법] 이전 페이지 이동 로직 */}
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="p-2 text-gray-400 hover:text-gray-600" 
      >
        {"<"}
      </button>
      
      {/* 페이지 번호 목록 */}
      {totalPages.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-all ${
            currentPage === num
              ? 'bg-gray-200 text-gray-700 shadow-sm'
              : 'text-gray-400 hover:bg-gray-50'
          }`}
        >
          {num}
        </button>
      ))}

      {/* 다음 페이지 이동 로직 */}
      <button 
        onClick={() => onPageChange(Math.min(totalPages.length, currentPage + 1))}
        className="p-2 text-gray-400 hover:text-gray-600"
      >
        {">"}
      </button>
    </div>
  );
}