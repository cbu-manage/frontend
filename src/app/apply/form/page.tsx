"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { applyApi } from "@/api";
import InputBox from "@/components/common/InputBox";
import { Button } from "@/components/ui/button";
import RecruitmentNotice from "@/components/apply/RecruitmentNotice";
import EmailVerificationField from "@/components/apply/EmailVerificationField";
import DepartmentSelect from "@/components/apply/DepartmentSelect";
import SchoolYearRadioGroup from "@/components/apply/SchoolYearRadioGroup";
import ApplyFieldCheckboxGroup from "@/components/apply/ApplyFieldCheckboxGroup";
import HowFoundRadioGroup from "@/components/apply/HowFoundRadioGroup";
import AttendanceRadioGroup from "@/components/apply/AttendanceRadioGroup";
import PrivacyAgreement from "@/components/apply/PrivacyAgreement";
import { RECRUIT_GENERATION } from "../constants";

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
  teamExperience: string;
  programmingMotivation: string;
  applyPurpose: string;
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
  teamExperience?: string;
  programmingMotivation?: string;
  applyPurpose?: string;
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
  teamExperience: "",
  programmingMotivation: "",
  applyPurpose: "",
  devLinks: "",
  howFound: "에브리타임",
  otAttendance: "가능",
  welcomePartyAttendance: "가능",
  privacyAgreed: false,
};

function validate(form: FormState): FormErrors {
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
  if (!form.teamExperience.trim())
    errors.teamExperience = "몰입 경험을 입력해주세요.";
  if (!form.programmingMotivation.trim())
    errors.programmingMotivation = "프로그래밍 시작 계기를 입력해주세요.";
  if (!form.applyPurpose.trim())
    errors.applyPurpose = "씨부엉 지원 목적을 입력해주세요.";
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

const REF_SOURCE_MAP: Record<string, string> = {
  에브리타임: "SNS",
  인스타그램: "SNS",
  지인추천: "FRIEND",
  기타: "ETC",
};

const APPLY_FIELD_MAP: Record<string, string> = {
  스터디: "STUDY",
  "프로젝트(개발)": "DEV",
  "프로젝트(디자인)": "DESIGN",
  "프로젝트(기획)": "PLAN",
};

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
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const handleVerify = () => {
    setForm((prev) => ({ ...prev, isEmailVerified: true }));
    setErrors((prev) => ({ ...prev, email: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
        applicationField: form.applyFields.map((f) => APPLY_FIELD_MAP[f]),
        portfolioUrl: form.devLinks,
        refSource: REF_SOURCE_MAP[form.howFound] ?? "ETC",
        canOt: form.otAttendance === "가능",
        canWelcome: form.welcomePartyAttendance === "가능",
        privacyPolicy: form.privacyAgreed,
      });
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
            씨부엉 {RECRUIT_GENERATION} 신규 부원 모집 — 본인 정보를 정확히
            입력해주세요
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
            {!form.isEmailVerified && (
              <div className="absolute -inset-x-8 -inset-y-4 z-10 rounded-xl bg-gray-900/30 flex items-center justify-center">
                <div className="w-90 h-90 bg-gray-0 rounded-full flex items-center justify-center shadow-lg">
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

              <div className="space-y-1.5">
                <p className="text-body-sm font-medium text-gray-900">
                  몰입 경험 <span className="text-notice">*</span>
                </p>
                <textarea
                  placeholder="프로그래밍 외에 오래 몰입했던 경험과 과정을 작성해주세요."
                  value={form.teamExperience}
                  onChange={(e) => setField("teamExperience")(e.target.value)}
                  rows={5}
                  className={`w-full rounded-xl px-4 py-4 text-base font-medium tracking-[-0.048px] leading-normal border text-gray-900 placeholder:text-gray-600 outline-none transition-all duration-150 resize-none ${
                    errors.teamExperience
                      ? "border-notice bg-gray-0"
                      : "border-gray-200 bg-gray-0 focus:border-brand focus:ring-1 focus:ring-brand"
                  }`}
                />
                {errors.teamExperience && (
                  <FieldError message={errors.teamExperience} />
                )}
              </div>

              <div className="space-y-1.5">
                <p className="text-body-sm font-medium text-gray-900">
                  프로그래밍 시작 계기 <span className="text-notice">*</span>
                </p>
                <textarea
                  placeholder="프로그래밍을 시작한 이유와 공부 과정을 작성해주세요."
                  value={form.programmingMotivation}
                  onChange={(e) =>
                    setField("programmingMotivation")(e.target.value)
                  }
                  rows={5}
                  className={`w-full rounded-xl px-4 py-4 text-base font-medium tracking-[-0.048px] leading-normal border text-gray-900 placeholder:text-gray-600 outline-none transition-all duration-150 resize-none ${
                    errors.programmingMotivation
                      ? "border-notice bg-gray-0"
                      : "border-gray-200 bg-gray-0 focus:border-brand focus:ring-1 focus:ring-brand"
                  }`}
                />
                {errors.programmingMotivation && (
                  <FieldError message={errors.programmingMotivation} />
                )}
              </div>

              <div className="space-y-1.5">
                <p className="text-body-sm font-medium text-gray-900">
                  씨부엉 지원 목적 <span className="text-notice">*</span>
                </p>
                <textarea
                  placeholder="참여 목적과 하고 싶은 활동을 작성해주세요."
                  value={form.applyPurpose}
                  onChange={(e) => setField("applyPurpose")(e.target.value)}
                  rows={5}
                  className={`w-full rounded-xl px-4 py-4 text-base font-medium tracking-[-0.048px] leading-normal border text-gray-900 placeholder:text-gray-600 outline-none transition-all duration-150 resize-none ${
                    errors.applyPurpose
                      ? "border-notice bg-gray-0"
                      : "border-gray-200 bg-gray-0 focus:border-brand focus:ring-1 focus:ring-brand"
                  }`}
                />
                {errors.applyPurpose && (
                  <FieldError message={errors.applyPurpose} />
                )}
              </div>

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
    </main>
  );
}
