export default function MyApplicationsSection() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        내 신청 목록
      </h1>

      <div className="py-12 text-center text-gray-500">
        아직 게시글 신청 목록이 연결되지 않았어요.
        <br />
        연동되면 이곳에 내가 신청한 스터디/프로젝트/코딩테스트 글 목록이 게시글
        형태로 노출될 예정입니다.
      </div>
    </div>
  );
}
