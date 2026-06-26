import PostWriteForm from "@/components/board/PostWriteForm";

export default function NoticeWritePage() {
  return (
    <PostWriteForm
      boardName="씨부엉 소식"
      heading="글 작성"
      categories={["공지", "이벤트", "IT소식"]}
      backPath="/notice"
    />
  );
}
