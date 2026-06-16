export default function RecruitmentNotice() {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-3">
      <p className="text-body-sm font-semibold text-gray-900">모집 안내</p>
      <div className="text-body-sm text-gray-900 space-y-1.5">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>▸ 지원 기간: 2026.03.04 ~ 03.18 (23:59 마감)</span>
          <span>▸ 결과 발표: 2026.03.21 (개별 안내)</span>
          <span>▸ 회비: 15,000원 (휴학·졸업생 5,000원)</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            ▸ 문의 링크:{" "}
            <a
              href="https://open.kakao.com/o/cbu-help"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-gray-900"
            >
              https://open.kakao.com/o/cbu-help
            </a>
          </span>
          <span>▸ 합격 안내: 학번 + 임시 비밀번호 발송 후 본인 인증 → 회비 납부 → 활동 시작</span>
        </div>
      </div>
    </div>
  );
}
