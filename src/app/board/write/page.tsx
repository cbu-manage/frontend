import PostWriteForm from "@/components/board/PostWriteForm";

export default function BoardWritePage() {
  return (
    <PostWriteForm
      boardName="자유게시판"
      heading="자유게시판 글쓰기"
      subtitle="※ 익명·실명 모두 가능 · 부적절한 글은 다른 회원이 신고할 수 있어요"
      categories={["일상", "질문", "잡담", "홍보"]}
      showAnonymous
      backPath="/board"
      contentPlaceholder="자유롭게 이야기를 나눠보세요."
    />
  );
}
