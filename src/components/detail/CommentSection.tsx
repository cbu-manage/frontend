"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Clock,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

interface CommentInputProps {
  placeholder?: string;
  depth?: number;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (content: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

/**
 * 댓글/대댓글 입력창 컴포넌트
 */
export const CommentInput = ({
  placeholder = "더 나은 해결 방식이나 보완할 점이 있나요? 서로의 성장을 위해 따뜻한 피드백을 남겨주세요!",
  depth = 0,
  value = "",
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
}: CommentInputProps) => {
  const isReply = depth > 0;
  const marginLeft = isReply ? `${depth * 48}px` : "0px";
  const isControlled = onChange !== undefined;
  const [localValue, setLocalValue] = useState("");
  const text = isControlled ? value : localValue;
  const setText = isControlled ? (onChange ?? (() => {})) : setLocalValue;

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSubmit?.(trimmed);
    if (!isControlled) setLocalValue("");
  };

  return (
    <div
      style={{ marginLeft }}
      className={`flex flex-col items-start gap-[10px] p-[28px_36px] rounded-[16px] border-2 border-gray-300 bg-white ${isReply ? "mt-6" : "w-full"}`}
    >
      <textarea
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        className="w-full min-h-[100px] border-none outline-none resize-none text-gray-900 text-base font-medium leading-[26px] placeholder:text-gray-400 disabled:opacity-60"
      />
      <div className="self-end flex gap-2">
        {isReply && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 rounded-full border border-gray-300 text-gray-600 text-base font-semibold hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !text.trim()}
          className="flex items-center justify-center px-5 py-2 gap-[7px] rounded-full bg-[#3E434A] text-white text-base font-semibold hover:bg-gray-700 transition-colors disabled:opacity-60"
        >
          등록
        </button>
      </div>
    </div>
  );
};

interface ReplyData {
  id: number;
  author: string;
  authorName?: string;
  content: string;
  date: string;
  replies?: ReplyData[];
  deleted?: boolean;
}

interface CommentItemProps {
  id: number;
  author: string;
  authorName?: string;
  content: string;
  date: string;
  depth?: number;
  replies?: ReplyData[];
  onReplySubmit?: (parentId: number, content: string) => void;
  onEditComment?: (id: number) => void;
  onDeleteComment?: (id: number) => void;
  disabled?: boolean;
  deleted?: boolean;
  currentUser?: string;
}

/**
 * 개별 댓글 아이템 컴포넌트
 */
export const CommentItem = ({
  id,
  author,
  authorName,
  content,
  date,
  depth = 0,
  replies = [],
  onReplySubmit,
  onEditComment,
  onDeleteComment,
  disabled = false,
  deleted = false,
  currentUser,
}: CommentItemProps) => {
  const isReply = depth > 0;
  const marginLeft = `${depth * 48}px`;
  const [replyOpen, setReplyOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [replyValue, setReplyValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = !!currentUser;
  const isMine = isLoggedIn && !!authorName && authorName === currentUser;
  const showReply = !deleted && isLoggedIn && depth < 4;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="w-full">
      <div
        style={{ marginLeft }}
        className={`group border-b border-gray-200 pb-6 ${isReply ? "pt-6" : "mt-10"}`}
      >
        <div className="flex justify-between items-start mb-2">
          <span className="font-bold text-gray-900 text-base">{author}</span>
          {isMine && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <MoreHorizontal size={20} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 min-w-[160px] py-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
                  <button
                    type="button"
                    onClick={() => {
                      onEditComment?.(id);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil size={18} className="shrink-0 text-gray-500" />
                    수정
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteComment?.(id);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={18} className="shrink-0" />
                    삭제
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-gray-800 text-base font-medium mb-4 leading-relaxed">
          {content}
        </p>

        <div className="flex items-center gap-4 text-gray-400 text-sm font-medium">
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{date}</span>
          </div>
          {showReply && (
            <button
              type="button"
              onClick={() => setReplyOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 transition-colors ${replyOpen ? "text-gray-900" : "hover:text-gray-600"}`}
            >
              <MessageCircle size={14} />
              <span>{replyOpen ? "답글 취소" : "답글쓰기"}</span>
            </button>
          )}
        </div>
      </div>

      {replyOpen && (
        <CommentInput
          placeholder="답글을 입력해 주세요."
          depth={depth + 1}
          value={replyValue}
          onChange={setReplyValue}
          onSubmit={(text) => {
            onReplySubmit?.(id, text);
            setReplyValue("");
            setReplyOpen(false);
          }}
          onCancel={() => setReplyOpen(false)}
          disabled={disabled}
        />
      )}

      {replies.length > 0 && (
        <div className="flex flex-col">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              {...reply}
              depth={depth + 1}
              onReplySubmit={onReplySubmit}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
              disabled={disabled}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
};
