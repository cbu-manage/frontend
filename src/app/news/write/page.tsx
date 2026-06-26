import PostWriteForm from "@/components/board/PostWriteForm";

export default function NewsWritePage() {
  return (
    <PostWriteForm
      boardName="뉴스레터"
      heading="글 작성"
      categories={["주간", "특집", "공지"]}
      staffOnly
      backPath="/news"
    />
  );
}
