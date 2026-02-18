"use client";

import React, { useState } from "react";
import { MessageCircle, Clock, MoreHorizontal } from "lucide-react";

interface CommentInputProps {
  placeholder?: string;
  depth?: number;
  onCancel?: () => void;
}

/**
 * 댓글/대댓글 입력창 컴포넌트
 */
export const CommentInput = ({ 
  placeholder = "더 나은 해결 방식이나 보완할 점이 있나요? 서로의 성장을 위해 따뜻한 피드백을 남겨주세요!", 
  depth = 0,
  onCancel
}: CommentInputProps) => {
  const isReply = depth > 0;
  const marginLeft = isReply ? `${depth * 48}px` : "0px";

  return (
    <div 
      style={{ marginLeft }}
      className={`flex flex-col items-start gap-[10px] p-[28px_36px] rounded-[16px] border-2 border-gray-300 bg-white ${isReply ? "mt-6" : "w-full"}`}
    >
      <textarea
        placeholder={placeholder}
        className="w-full min-h-[100px] border-none outline-none resize-none text-[#222222] text-base font-medium leading-[26px] placeholder:text-gray-400"
      />
      <div className="self-end flex gap-2">
        {isReply && (
          <button 
            onClick={onCancel}
            className="px-5 py-2 rounded-full border border-gray-300 text-gray-600 text-base font-semibold hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        )}
        <button className="flex items-center justify-center px-5 py-2 gap-[7px] rounded-full bg-[#3E434A] text-white text-base font-semibold hover:bg-gray-700 transition-colors">
          등록
        </button>
      </div>
    </div>
  );
};

interface ReplyData {
  id: number;
  author: string;
  content: string;
  date: string;
  replies?: ReplyData[];
}

interface CommentItemProps {
  id: number;
  author: string;
  content: string;
  date: string;
  depth?: number;
  replies?: ReplyData[];
  activeReplyId: number | null;
  onReplyClick: (id: number | null) => void;
}

/**
 * 개별 댓글 아이템 컴포넌트
 */
export const CommentItem = ({ 
  id, 
  author, 
  content, 
  date, 
  depth = 0, 
  replies = [], 
  activeReplyId, 
  onReplyClick 
}: CommentItemProps) => {
  const isReply = depth > 0;
  const marginLeft = `${depth * 48}px`;
  const isOpen = activeReplyId === id;

  return (
    <div className="w-full">
      {/* 댓글 본체 - 댓글/답글 모두 아래쪽 구분선 */}
      <div 
        style={{ marginLeft }}
        className={`group border-b border-gray-200 pb-6 ${isReply ? "pt-6" : "mt-10"}`}
      >
        <div className="flex justify-between items-start mb-2">
          <span className="font-bold text-gray-900 text-base">{author}</span>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={20} />
          </button>
        </div>
        
        <p className="text-gray-800 text-base font-medium mb-4 leading-relaxed">
          {content}
        </p>
        
        <div className="flex items-center gap-4 text-gray-400 text-sm font-medium">
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{date}</span>
          </div>
          <button 
            onClick={() => onReplyClick(isOpen ? null : id)}
            className={`flex items-center gap-1.5 transition-colors ${isOpen ? "text-gray-900" : "hover:text-gray-600"}`}
          >
            <MessageCircle size={14} />
            <span>{isOpen ? "답글 취소" : "답글쓰기"}</span>
          </button>
        </div>
      </div>

      {/* 대댓글 입력창 - 댓글 본체와 기존 답글들 '사이'에 위치 */}
      {isOpen && (
        <CommentInput 
          placeholder="답글을 입력해 주세요." 
          depth={depth + 1} 
          onCancel={() => onReplyClick(null)}
        />
      )}

      {/* 대댓글 리스트 (기존 답글들) */}
      {replies.length > 0 && (
        <div className="flex flex-col">
          {replies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              {...reply} 
              depth={depth + 1} 
              activeReplyId={activeReplyId}
              onReplyClick={onReplyClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
