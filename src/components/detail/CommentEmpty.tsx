import Mascot from "@/components/common/Mascot";

/**
 * 댓글이 없을 때 빈 상태 — sad 마스코트 + 안내 문구.
 * (Figma: 공지사항 상세 - 댓글 없을 때 / Mascot form=sad)
 */
export default function CommentEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <Mascot emotion="sad" size="md" />
      <p className="text-sm text-gray-600">
        아직 댓글이 없어요! 첫 번째 댓글을 남겨주세요!
      </p>
    </div>
  );
}
