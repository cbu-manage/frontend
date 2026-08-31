"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  applyApi,
  questionApi,
  type ApplicationMyResponse,
  type ApplicationQuestion,
} from "@/api";
import InputBox from "@/components/common/InputBox";
import { Button } from "@/components/ui/button";
import RecruitmentNotice from "@/components/apply/RecruitmentNotice";
import DraftRestoreToast from "@/components/apply/DraftRestoreToast";
import EmailVerificationField from "@/components/apply/EmailVerificationField";
import DepartmentSelect from "@/components/apply/DepartmentSelect";
import SchoolYearRadioGroup from "@/components/apply/SchoolYearRadioGroup";
import ApplyFieldCheckboxGroup from "@/components/apply/ApplyFieldCheckboxGroup";
import HowFoundRadioGroup from "@/components/apply/HowFoundRadioGroup";
import AttendanceRadioGroup from "@/components/apply/AttendanceRadioGroup";
import PrivacyAgreement from "@/components/apply/PrivacyAgreement";
import { useRecruitmentInfo } from "@/hooks/apply";

type FormState = {
  email: string;
  verificationCode: string;
  isEmailVerified: boolean;
  name: string;
  nickname: string;
  studentId: string;
  phoneNumber: string;
  department: string;
  schoolYear: string;
  applyFields: string[];
  /** 지원서 질문 답변. 키는 서버 질문의 type — 기수마다 운영진이 편집한다 */
  answers: Record<string, string>;
  devLinks: string;
  howFound: string;
  otAttendance: string;
  welcomePartyAttendance: string;
  privacyAgreed: boolean;
};

type FormErrors = {
  email?: string;
  name?: string;
  nickname?: string;
  studentId?: string;
  phoneNumber?: string;
  department?: string;
  applyFields?: string;
  /** 질문 type → 에러 메시지 */
  answers?: Record<string, string>;
  privacyAgreed?: string;
};

const INITIAL_FORM: FormState = {
  email: "",
  verificationCode: "",
  isEmailVerified: false,
  name: "",
  nickname: "",
  studentId: "",
  phoneNumber: "",
  department: "",
  schoolYear: "1학년",
  applyFields: [],
  answers: {},
  devLinks: "",
  howFound: "에브리타임",
  otAttendance: "가능",
  welcomePartyAttendance: "가능",
  privacyAgreed: false,
};

/** 작성 중인 내용 임시 보관 — 새로고침·실수로 나갔다 와도 다시 쓰지 않게 한다 */
const DRAFT_KEY = "applyFormDraft";
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** 인증 관련 값은 보관하지 않는다(코드는 만료되고, 인증 상태는 다시 받아야 한다) */
type SavedDraft = {
  savedAt: number;
  form: Omit<FormState, "verificationCode" | "isEmailVerified">;
};

function loadLocalDraft(): SavedDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedDraft;
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveLocalDraft(form: FormState) {
  try {
    const { verificationCode: _c, isEmailVerified: _v, ...rest } = form;
    void _c;
    void _v;
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ savedAt: Date.now(), form: rest } satisfies SavedDraft),
    );
  } catch {
    // 저장 공간이 없거나 차단된 환경 — 임시저장만 포기하고 작성은 계속할 수 있게 둔다
  }
}

function clearLocalDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // noop
  }
}

function validate(
  form: FormState,
  questions: ApplicationQuestion[],
  answers: Record<string, string>,
): FormErrors {
  const errors: FormErrors = {};
  if (!form.isEmailVerified) errors.email = "이메일 인증을 완료해주세요.";
  if (!form.name.trim()) errors.name = "이름을 입력해주세요.";
  if (!form.nickname.trim()) errors.nickname = "닉네임을 입력해주세요.";
  if (!form.studentId) {
    errors.studentId = "학번을 입력해주세요.";
  } else if (!/^\d{10}$/.test(form.studentId)) {
    errors.studentId = "10자리 숫자로 입력해주세요. (예: 2026000000)";
  }
  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = "전화번호를 입력해주세요.";
  } else if (!/^010\d{8}$/.test(form.phoneNumber.replace(/-/g, ""))) {
    errors.phoneNumber = "올바른 전화번호를 입력해주세요. (예: 01012345678)";
  }
  if (!form.department) errors.department = "학과를 선택해주세요.";
  if (form.applyFields.length === 0) {
    errors.applyFields = "지원 분야를 1개 이상 선택해주세요.";
  }
  // 어떤 질문이 필수인지는 서버에 등록된 질문(isRequired)이 정한다
  const answerErrors: Record<string, string> = {};
  questions.forEach((q) => {
    if (q.isRequired && !(answers[q.type] ?? "").trim()) {
      answerErrors[q.type] = "필수 답변이에요. 내용을 입력해주세요.";
    }
  });
  if (Object.keys(answerErrors).length > 0) errors.answers = answerErrors;
  if (!form.privacyAgreed)
    errors.privacyAgreed = "개인정보 수집·이용에 동의해주세요.";
  return errors;
}

const GRADE_MAP: Record<string, string> = {
  "1학년": "FRESHMAN",
  "2학년": "SOPHOMORE",
  "3학년": "JUNIOR",
  "4학년": "SENIOR",
  졸업생: "GRADUATE",
  휴학생: "ABSENCE",
};

const GRADE_MAP_REVERSE = Object.fromEntries(
  Object.entries(GRADE_MAP).map(([k, v]) => [v, k]),
) as Record<string, string>;

const APPLY_FIELD_MAP: Record<string, string> = {
  스터디: "STUDY",
  "프로젝트(개발)": "DEV",
  "프로젝트(디자인)": "DESIGN",
  "프로젝트(기획)": "PLAN",
};

const APPLY_FIELD_MAP_REVERSE = Object.fromEntries(
  Object.entries(APPLY_FIELD_MAP).map(([k, v]) => [v, k]),
) as Record<string, string>;

const REF_SOURCE_MAP: Record<string, string> = {
  에브리타임: "EVERYTIME",
  인스타그램: "INSTAGRAM",
  지인추천: "FRIEND",
  기타: "ETC",
};

const REF_SOURCE_MAP_REVERSE = Object.fromEntries(
  Object.entries(REF_SOURCE_MAP).map(([k, v]) => [v, k]),
) as Record<string, string>;

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-caption text-notice flex items-center gap-1 mt-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="11"
        height="11"
        viewBox="0 0 11 11"
        fill="none"
        className="shrink-0 text-notice"
      >
        <path
          d="M5.41667 8.125C5.57014 8.125 5.69878 8.07309 5.8026 7.96927C5.90642 7.86545 5.95833 7.7368 5.95833 7.58333C5.95833 7.42986 5.90642 7.30121 5.8026 7.1974C5.69878 7.09358 5.57014 7.04167 5.41667 7.04167C5.26319 7.04167 5.13455 7.09358 5.03073 7.1974C4.92691 7.30121 4.875 7.42986 4.875 7.58333C4.875 7.7368 4.92691 7.86545 5.03073 7.96927C5.13455 8.07309 5.26319 8.125 5.41667 8.125ZM4.875 5.95833H5.95833V2.70833H4.875V5.95833ZM5.41667 10.8333C4.66736 10.8333 3.96319 10.6911 3.30417 10.4068C2.64514 10.1224 2.07187 9.73646 1.58437 9.24896C1.09687 8.76146 0.710937 8.18819 0.426562 7.52917C0.142187 6.87014 0 6.16597 0 5.41667C0 4.66736 0.142187 3.96319 0.426562 3.30417C0.710937 2.64514 1.09687 2.07187 1.58437 1.58437C2.07187 1.09687 2.64514 0.710937 3.30417 0.426562C3.96319 0.142187 4.66736 0 5.41667 0C6.16597 0 6.87014 0.142187 7.52917 0.426562C8.18819 0.710937 8.76146 1.09687 9.24896 1.58437C9.73646 2.07187 10.1224 2.64514 10.4068 3.30417C10.6911 3.96319 10.8333 4.66736 10.8333 5.41667C10.8333 6.16597 10.6911 6.87014 10.4068 7.52917C10.1224 8.18819 9.73646 8.76146 9.24896 9.24896C8.76146 9.73646 8.18819 10.1224 7.52917 10.4068C6.87014 10.6911 6.16597 10.8333 5.41667 10.8333ZM5.41667 9.75C6.62639 9.75 7.65104 9.33021 8.49062 8.49062C9.33021 7.65104 9.75 6.62639 9.75 5.41667C9.75 4.20694 9.33021 3.18229 8.49062 2.34271C7.65104 1.50312 6.62639 1.08333 5.41667 1.08333C4.20694 1.08333 3.18229 1.50312 2.34271 2.34271C1.50312 3.18229 1.08333 4.20694 1.08333 5.41667C1.08333 6.62639 1.50312 7.65104 2.34271 8.49062C3.18229 9.33021 4.20694 9.75 5.41667 9.75Z"
          fill="currentColor"
        />
      </svg>
      {message}
    </p>
  );
}

export default function ApplyFormPage() {
  // 기수 표기는 진행 중인 모집을 따른다 (없으면 빈 문자열 → 문구에서 자연히 빠짐)
  const { generationLabel, resultLabel } = useRecruitmentInfo();
  const router = useRouter();
  // 제출 확인(/apply)에서 넘어온 기존 신청서. 답변은 질문 목록을 받은 뒤 채운다(아래 useEffect)
  const [draft] = useState<ApplicationMyResponse | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("applyDraft");
    if (!raw) return null;
    sessionStorage.removeItem("applyDraft");
    return JSON.parse(raw) as ApplicationMyResponse;
  });

  // 질문은 운영진이 기수마다 편집한다 — 화면 문구도 전송 키도 서버 목록을 그대로 따른다
  const { data: questions, isLoading: isQuestionsLoading } = useQuery({
    queryKey: ["applications", "questions", "current"],
    queryFn: async () => (await questionApi.getCurrent()).data.data,
  });

  const sortedQuestions = useMemo(
    () => [...(questions ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [questions],
  );

  // 작성하다 만 내용. 자동으로 채우지 않고 이어서 쓸지 물어본다.
  const [pendingDraft, setPendingDraft] = useState<SavedDraft | null>(() =>
    draft ? null : loadLocalDraft(),
  );

  const [form, setForm] = useState<FormState>(() => {
    if (!draft) return INITIAL_FORM;
    return {
      ...INITIAL_FORM,
      email: draft.email.replace(/@tukorea\.ac\.kr$/, ""),
      // 서버가 제출 시 emailAuthCode를 Redis와 대조하므로, 복원해도 인증은 다시 받아야 함
      name: draft.name,
      nickname: draft.nickname,
      studentId: String(draft.studentNumber),
      phoneNumber: draft.phoneNumber,
      department: draft.major,
      schoolYear: GRADE_MAP_REVERSE[draft.grade] ?? "1학년",
      applyFields: draft.applicationFields
        .map((f) => APPLY_FIELD_MAP_REVERSE[f])
        .filter(Boolean),
      devLinks: draft.portfolioUrl ?? "",
      howFound: REF_SOURCE_MAP_REVERSE[draft.refSource] ?? "기타",
      // 라디오 선택지가 "가능"/"불가능"이라 값이 맞아야 선택 상태로 복원된다
      otAttendance: draft.canOt ? "가능" : "불가능",
      welcomePartyAttendance: draft.canWelcome ? "가능" : "불가능",
      privacyAgreed: true,
    };
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 서버는 answers를 질문 "텍스트"로 내려준다 → 질문 목록에서 type을 되찾는다.
  // 질문 조회가 끝나야 매칭되므로 상태가 아니라 파생값으로 둔다(사용자 입력이 항상 우선).
  const draftAnswers = useMemo<Record<string, string>>(() => {
    if (!draft) return {};
    const answerByQuestion = new Map(
      draft.answers.map(({ question, answer }) => [question, answer]),
    );
    return Object.fromEntries(
      sortedQuestions.map((q) => [
        q.type,
        answerByQuestion.get(q.question) ?? "",
      ]),
    );
  }, [draft, sortedQuestions]);

  const answers = useMemo(
    () => ({ ...draftAnswers, ...form.answers }),
    [draftAnswers, form.answers],
  );

  // 인증을 마치기 전이든 후든 입력한 값은 계속 보관한다.
  // 단 이어쓸지 정하기 전에는 저장하지 않는다 — 빈 폼이 기존 임시저장을 덮어쓴다.
  useEffect(() => {
    if (pendingDraft) return;
    saveLocalDraft(form);
  }, [form, pendingDraft]);

  const handleRestoreDraft = () => {
    if (!pendingDraft) return;
    // 인증 관련 값은 저장하지 않으므로 이메일 인증은 다시 받아야 한다
    setForm((prev) => ({ ...prev, ...pendingDraft.form }));
    setPendingDraft(null);
  };

  const handleDiscardDraft = () => {
    clearLocalDraft();
    setPendingDraft(null);
  };

  const setField =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const setAnswer = (type: string) => (value: string) => {
    setForm((prev) => ({
      ...prev,
      answers: { ...prev.answers, [type]: value },
    }));
    setErrors((prev) => {
      if (!prev.answers?.[type]) return prev;
      const next = { ...prev.answers };
      delete next[type];
      return { ...prev, answers: next };
    });
  };

  const handleVerify = () => {
    setForm((prev) => ({ ...prev, isEmailVerified: true }));
    setErrors((prev) => ({ ...prev, email: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form, sortedQuestions, answers);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // 에러가 화면 밖에 있으면 "버튼을 눌렀는데 아무 일도 안 일어남"으로 보인다
      requestAnimationFrame(() => {
        document
          .querySelector("p.text-notice")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await applyApi.submit({
        email: `${form.email}@tukorea.ac.kr`,
        name: form.name,
        nickname: form.nickname,
        studentNumber: parseInt(form.studentId, 10),
        phoneNumber: form.phoneNumber.replace(/-/g, ""),
        emailAuthCode: form.verificationCode,
        major: form.department,
        grade: GRADE_MAP[form.schoolYear],
        applicationFields: form.applyFields.map((f) => APPLY_FIELD_MAP[f]),
        answers,
        portfolioUrl: form.devLinks,
        refSource: REF_SOURCE_MAP[form.howFound] ?? "ETC",
        canOt: form.otAttendance === "가능",
        canWelcome: form.welcomePartyAttendance === "가능",
        privacyPolicy: form.privacyAgreed,
      });
      // 접수됐다는 사실이 화면에 안 남으면 지원자는 냈는지 알 수 없다
      clearLocalDraft();
      window.alert(
        resultLabel
          ? `신청서가 접수됐어요.\n결과 발표 : ${resultLabel}`
          : "신청서가 접수됐어요. 결과는 개별 안내드립니다.",
      );
      router.push("/");
    } catch (err) {
      window.alert(
        (err as Error).message || "신청서 제출 중 오류가 발생했습니다.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-0 container-x py-12">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <h1 className="text-h1 font-bold text-gray-900">
            씨부엉 가입 신청서
          </h1>
          <p className="mt-1 text-body-sm text-gray-600">
            씨부엉 {generationLabel && `${generationLabel} `}신규 부원 모집 —
            본인 정보를 정확히 입력해주세요
          </p>
        </div>

        <RecruitmentNotice />

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
          <EmailVerificationField
            email={form.email}
            onEmailChange={setField("email")}
            verificationCode={form.verificationCode}
            onCodeChange={setField("verificationCode")}
            isVerified={form.isEmailVerified}
            onVerify={handleVerify}
            errorMessage={errors.email}
          />

          <div className="border-t border-gray-200" />

          <div className="relative" inert={!form.isEmailVerified}>
            {/* 좁은 화면에서 오버레이가 화면 밖으로 삐져나가 가로 스크롤이 생기던 것을 반응형으로 */}
            {!form.isEmailVerified && (
              <div className="absolute -inset-x-4 -inset-y-4 sm:-inset-x-8 z-10 rounded-xl bg-gray-900/30 flex items-center justify-center">
                <div className="w-56 h-56 sm:w-90 sm:h-90 bg-gray-0 rounded-full flex items-center justify-center shadow-lg">
                  <Image
                    src="/assets/owl-verify.svg"
                    alt="인증을 완료해주세요"
                    width={280}
                    height={280}
                    className="object-contain mx-auto -translate-y-3"
                  />
                </div>
              </div>
            )}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputBox
                  label="이름"
                  placeholder="이름 입력"
                  value={form.name}
                  onChange={(e) => setField("name")(e.target.value)}
                  errorMessage={errors.name}
                  variant="outline"
                  required
                />
                <InputBox
                  label="닉네임"
                  placeholder="합격 공지에 사용할 닉네임 입력"
                  value={form.nickname}
                  onChange={(e) => setField("nickname")(e.target.value)}
                  errorMessage={errors.nickname}
                  variant="outline"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DepartmentSelect
                  value={form.department}
                  onChange={setField("department")}
                  errorMessage={errors.department}
                />
                <InputBox
                  label="학번"
                  placeholder="2026000000"
                  value={form.studentId}
                  onChange={(e) => setField("studentId")(e.target.value)}
                  errorMessage={errors.studentId}
                  variant="outline"
                  required
                />
              </div>

              <InputBox
                label="전화번호"
                placeholder="01012345678"
                value={form.phoneNumber}
                onChange={(e) => setField("phoneNumber")(e.target.value)}
                errorMessage={errors.phoneNumber}
                variant="outline"
                required
              />

              <SchoolYearRadioGroup
                value={form.schoolYear}
                onChange={setField("schoolYear")}
              />

              <ApplyFieldCheckboxGroup
                value={form.applyFields}
                onChange={setField("applyFields")}
                errorMessage={errors.applyFields}
              />

              {isQuestionsLoading ? (
                <p className="text-body-sm text-gray-600">
                  지원서 질문을 불러오는 중이에요...
                </p>
              ) : sortedQuestions.length === 0 ? (
                <p className="text-body-sm text-gray-600">
                  지금은 답변할 지원서 질문이 없어요. 모집이 열렸는지
                  확인해주세요.
                </p>
              ) : (
                sortedQuestions.map((q) => (
                  <div key={q.questionUuid} className="space-y-1.5">
                    <p className="text-body-sm font-medium text-gray-900">
                      {q.question}
                      {q.isRequired && <span className="text-notice"> *</span>}
                    </p>
                    <textarea
                      placeholder={q.description || "답변을 작성해주세요."}
                      value={answers[q.type] ?? ""}
                      onChange={(e) => setAnswer(q.type)(e.target.value)}
                      rows={5}
                      className={`w-full rounded-xl px-4 py-4 text-base font-medium tracking-[-0.048px] leading-normal border text-gray-900 placeholder:text-gray-600 outline-none transition-all duration-150 resize-none ${
                        errors.answers?.[q.type]
                          ? "border-notice bg-gray-0"
                          : "border-gray-200 bg-gray-0 focus:border-brand focus:ring-1 focus:ring-brand"
                      }`}
                    />
                    {errors.answers?.[q.type] && (
                      <FieldError message={errors.answers[q.type]} />
                    )}
                  </div>
                ))
              )}

              <InputBox
                label="개발 관련 링크"
                placeholder="GitHub / 블로그 / solved.ac 링크 입력"
                value={form.devLinks}
                onChange={(e) => setField("devLinks")(e.target.value)}
                variant="outline"
              />

              <HowFoundRadioGroup
                value={form.howFound}
                onChange={setField("howFound")}
              />

              <AttendanceRadioGroup
                label="OT 참석 여부"
                name="otAttendance"
                value={form.otAttendance}
                onChange={setField("otAttendance")}
              />

              <AttendanceRadioGroup
                label="신입생 환영회 참석 여부"
                name="welcomePartyAttendance"
                value={form.welcomePartyAttendance}
                onChange={setField("welcomePartyAttendance")}
              />

              <PrivacyAgreement
                checked={form.privacyAgreed}
                onChange={setField("privacyAgreed")}
                errorMessage={errors.privacyAgreed}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="brand"
              disabled={isSubmitting}
              className="h-auto rounded-lg px-8 py-4 text-base font-medium"
            >
              {isSubmitting ? "제출 중..." : "지원하기"}
            </Button>
          </div>
        </form>
      </div>

      {pendingDraft && (
        <DraftRestoreToast
          savedAt={pendingDraft.savedAt}
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
        />
      )}
    </main>
  );
}
