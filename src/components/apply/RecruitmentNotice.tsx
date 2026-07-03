import { RECRUIT_PERIOD, RECRUIT_RESULT_DATE } from "@/app/apply/constants";

export default function RecruitmentNotice() {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-7 py-5 space-y-3">
      <p className="text-body-sm font-semibold text-gray-900">모집 안내</p>
      <div className="grid grid-cols-1 sm:grid-cols-[max-content_max-content_max-content] sm:justify-between gap-x-4 gap-y-2 text-body-sm text-gray-900 whitespace-nowrap">
        <span>▶ 지원 기간 : {RECRUIT_PERIOD}</span>
        <span>▶ 결과 발표 : {RECRUIT_RESULT_DATE}</span>
        <span>▶ 회비 : 15,000원 (휴학·졸업생 5,000원)</span>
        <span>
          ▶ 문의 링크 :{" "}
          <a
            href="https://open.kakao.com/o/cbu-help"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-gray-900"
          >
            https://open.kakao.com/o/cbu-help
          </a>
        </span>
        <span className="sm:col-span-2">
          ▶ 합격 안내 : 학번+임시 비밀번호 발송 후 본인 인증 → 회비 납부 → 활동
          시작
        </span>
      </div>
    </div>
  );
}
