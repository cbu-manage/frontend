import Image from "next/image";

/**
 * 댓글이 없을 때 빈 상태 — 졸린 마스코트 + 안내 문구.
 * (Figma: 공지사항 상세 - 댓글 없을 때)
 */
export default function CommentEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <Image
        src="/assets/sadowl.svg"
        width={96}
        height={96}
        alt=""
        className="select-none"
      />
      <p className="text-sm text-gray-600">
        아직 댓글이 없어요! 첫 번째 댓글을 남겨주세요!
      </p>
    </div>
  );
}
