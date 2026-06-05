"use client";

import { useState } from "react";
import { applyApi } from "@/api/apply.api";
import InputBox from "@/components/common/InputBox";
import ShortBtn from "@/components/common/ShortBtn";
import RecruitmentNotice from "@/components/apply/RecruitmentNotice";
import EmailVerificationField from "@/components/apply/EmailVerificationField";
import DepartmentSelect from "@/components/apply/DepartmentSelect";
import SchoolYearRadioGroup from "@/components/apply/SchoolYearRadioGroup";
import ApplyFieldCheckboxGroup from "@/components/apply/ApplyFieldCheckboxGroup";
import HowFoundRadioGroup from "@/components/apply/HowFoundRadioGroup";
import AttendanceRadioGroup from "@/components/apply/AttendanceRadioGroup";
import PrivacyAgreement from "@/components/apply/PrivacyAgreement";

type FormState = {
  email: string;
  verificationCode: string;
  isEmailVerified: boolean;
  name: string;
  nickname: string;
  birthDate: string;
  studentId: string;
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
  birthDate?: string;
  studentId?: string;
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
  birthDate: "",
  studentId: "",
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
  if (!form.birthDate) {
    errors.birthDate = "생년월일을 입력해주세요.";
  } else if (!/^\d{6}$/.test(form.birthDate)) {
    errors.birthDate = "6자리 숫자로 입력해주세요. (예: 070101)";
  }
  if (!form.studentId) {
    errors.studentId = "학번을 입력해주세요.";
  } else if (!/^\d{10}$/.test(form.studentId)) {
    errors.studentId = "10자리 숫자로 입력해주세요. (예: 2026000000)";
  }
  if (!form.department) errors.department = "학과를 선택해주세요.";
  if (form.applyFields.length === 0) {
    errors.applyFields = "지원 분야를 1개 이상 선택해주세요.";
  }
  if (!form.teamExperience.trim()) errors.teamExperience = "몰입 경험을 입력해주세요.";
  if (!form.programmingMotivation.trim()) errors.programmingMotivation = "프로그래밍 시작 계기를 입력해주세요.";
  if (!form.applyPurpose.trim()) errors.applyPurpose = "씨부엉 지원 목적을 입력해주세요.";
  if (!form.privacyAgreed) errors.privacyAgreed = "개인정보 수집·이용에 동의해주세요.";
  return errors;
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "#ff4e4e" }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" className="shrink-0">
        <path d="M5.41667 8.125C5.57014 8.125 5.69878 8.07309 5.8026 7.96927C5.90642 7.86545 5.95833 7.7368 5.95833 7.58333C5.95833 7.42986 5.90642 7.30121 5.8026 7.1974C5.69878 7.09358 5.57014 7.04167 5.41667 7.04167C5.26319 7.04167 5.13455 7.09358 5.03073 7.1974C4.92691 7.30121 4.875 7.42986 4.875 7.58333C4.875 7.7368 4.92691 7.86545 5.03073 7.96927C5.13455 8.07309 5.26319 8.125 5.41667 8.125ZM4.875 5.95833H5.95833V2.70833H4.875V5.95833ZM5.41667 10.8333C4.66736 10.8333 3.96319 10.6911 3.30417 10.4068C2.64514 10.1224 2.07187 9.73646 1.58437 9.24896C1.09687 8.76146 0.710937 8.18819 0.426562 7.52917C0.142187 6.87014 0 6.16597 0 5.41667C0 4.66736 0.142187 3.96319 0.426562 3.30417C0.710937 2.64514 1.09687 2.07187 1.58437 1.58437C2.07187 1.09687 2.64514 0.710937 3.30417 0.426562C3.96319 0.142187 4.66736 0 5.41667 0C6.16597 0 6.87014 0.142187 7.52917 0.426562C8.18819 0.710937 8.76146 1.09687 9.24896 1.58437C9.73646 2.07187 10.1224 2.64514 10.4068 3.30417C10.6911 3.96319 10.8333 4.66736 10.8333 5.41667C10.8333 6.16597 10.6911 6.87014 10.4068 7.52917C10.1224 8.18819 9.73646 8.76146 9.24896 9.24896C8.76146 9.73646 8.18819 10.1224 7.52917 10.4068C6.87014 10.6911 6.16597 10.8333 5.41667 10.8333ZM5.41667 9.75C6.62639 9.75 7.65104 9.33021 8.49062 8.49062C9.33021 7.65104 9.75 6.62639 9.75 5.41667C9.75 4.20694 9.33021 3.18229 8.49062 2.34271C7.65104 1.50312 6.62639 1.08333 5.41667 1.08333C4.20694 1.08333 3.18229 1.50312 2.34271 2.34271C1.50312 3.18229 1.08333 4.20694 1.08333 5.41667C1.08333 6.62639 1.50312 7.65104 2.34271 8.49062C3.18229 9.33021 4.20694 9.75 5.41667 9.75Z" fill="#FF4E4E" />
      </svg>
      {message}
    </p>
  );
}

export default function ApplyFormClient() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const setField = <K extends keyof FormState>(key: K) => (value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleVerify = () => {
    // 이메일 인증 로직 필요
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
    await applyApi.submit({
      email: form.email,
      name: form.name,
      nickname: form.nickname,
      birthDate: form.birthDate,
      studentId: form.studentId,
      department: form.department,
      schoolYear: form.schoolYear,
      applyFields: form.applyFields,
      teamExperience: form.teamExperience,
      programmingMotivation: form.programmingMotivation,
      applyPurpose: form.applyPurpose,
      devLinks: form.devLinks,
      howFound: form.howFound,
      otAttendance: form.otAttendance,
      welcomePartyAttendance: form.welcomePartyAttendance,
    });
  };

  return (
    <main className="min-h-screen bg-gray-0 py-12 px-4">
      <div className="mx-auto w-full max-w-3xl">
        {/* 페이지 제목 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">씨부엉 가입 신청서</h1>
          <p className="mt-1 text-sm text-gray-600">
            씨부엉 36기 신규 부원 모집 — 본인 정보를 정확히 입력해주세요
          </p>
        </div>

        {/* 모집 안내 */}
        <RecruitmentNotice />

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* 이메일 인증 */}
          <EmailVerificationField
            email={form.email}
            onEmailChange={setField("email")}
            verificationCode={form.verificationCode}
            onCodeChange={setField("verificationCode")}
            isVerified={form.isEmailVerified}
            onVerify={handleVerify}
            errorMessage={errors.email}
          />

          {/* 이름 / 닉네임 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputBox
              label="이름"
              placeholder="이름 입력"
              value={form.name}
              onChange={(e) => setField("name")(e.target.value)}
              errorMessage={errors.name}
              required
            />
            <InputBox
              label="닉네임"
              placeholder="합격 공지에 사용할 닉네임 입력"
              value={form.nickname}
              onChange={(e) => setField("nickname")(e.target.value)}
              errorMessage={errors.nickname}
              required
            />
          </div>

          {/* 생년월일 / 학번 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputBox
              label="생년월일"
              placeholder="070101"
              value={form.birthDate}
              onChange={(e) => setField("birthDate")(e.target.value)}
              errorMessage={errors.birthDate}
              maxLength={6}
              required
            />
            <InputBox
              label="학번"
              placeholder="2026000000"
              value={form.studentId}
              onChange={(e) => setField("studentId")(e.target.value)}
              errorMessage={errors.studentId}
              required
            />
          </div>

          {/* 학과 */}
          <DepartmentSelect
            value={form.department}
            onChange={setField("department")}
            errorMessage={errors.department}
          />

          {/* 학년 */}
          <SchoolYearRadioGroup
            value={form.schoolYear}
            onChange={setField("schoolYear")}
          />

          {/* 지원 분야 */}
          <ApplyFieldCheckboxGroup
            value={form.applyFields}
            onChange={setField("applyFields")}
            errorMessage={errors.applyFields}
          />

          {/* 몰입 경험 */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-900">
              몰입 경험 <span className="text-notice">*</span>
            </p>
            <textarea
              placeholder="프로그래밍 외에 오래 몰입했던 경험과 과정을 작성해주세요."
              value={form.teamExperience}
              onChange={(e) => setField("teamExperience")(e.target.value)}
              rows={5}
              className={`w-full rounded-lg px-4 py-[15px] text-base font-medium tracking-[-0.048px] leading-normal border text-gray-900 placeholder:text-gray-600 outline-none transition-all duration-150 resize-none ${errors.teamExperience
                ? "border-[#ff4e4e] bg-gray-0"
                : "border-transparent bg-gray-50 focus:bg-gray-0 focus:border-brand focus:ring-1 focus:ring-brand"
                }`}
            />
            {errors.teamExperience && <FieldError message={errors.teamExperience} />}
          </div>

          {/* 프로그래밍 시작 계기 */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-900">
              프로그래밍 시작 계기 <span className="text-notice">*</span>
            </p>
            <textarea
              placeholder="프로그래밍을 시작한 이유와 공부 과정을 작성해주세요."
              value={form.programmingMotivation}
              onChange={(e) => setField("programmingMotivation")(e.target.value)}
              rows={5}
              className={`w-full rounded-lg px-4 py-[15px] text-base font-medium tracking-[-0.048px] leading-normal border text-gray-900 placeholder:text-gray-600 outline-none transition-all duration-150 resize-none ${errors.programmingMotivation
                ? "border-[#ff4e4e] bg-gray-0"
                : "border-transparent bg-gray-50 focus:bg-gray-0 focus:border-brand focus:ring-1 focus:ring-brand"
                }`}
            />
            {errors.programmingMotivation && <FieldError message={errors.programmingMotivation} />}
          </div>

          {/* 씨부엉 지원 목적 */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-900">
              씨부엉 지원 목적 <span className="text-notice">*</span>
            </p>
            <textarea
              placeholder="참여 목적과 하고 싶은 활동을 작성해주세요."
              value={form.applyPurpose}
              onChange={(e) => setField("applyPurpose")(e.target.value)}
              rows={5}
              className={`w-full rounded-lg px-4 py-[15px] text-base font-medium tracking-[-0.048px] leading-normal border text-gray-900 placeholder:text-gray-600 outline-none transition-all duration-150 resize-none ${errors.applyPurpose
                ? "border-[#ff4e4e] bg-gray-0"
                : "border-transparent bg-gray-50 focus:bg-gray-0 focus:border-brand focus:ring-1 focus:ring-brand"
                }`}
            />
            {errors.applyPurpose && <FieldError message={errors.applyPurpose} />}
          </div>

          {/* 개발 관련 링크 */}
          <InputBox
            label="개발 관련 링크"
            placeholder="GitHub / 블로그 / solved.ac 링크 입력"
            value={form.devLinks}
            onChange={(e) => setField("devLinks")(e.target.value)}
          />

          {/* 알게 된 경로 */}
          <HowFoundRadioGroup
            value={form.howFound}
            onChange={setField("howFound")}
          />

          {/* OT 참석 여부 */}
          <AttendanceRadioGroup
            label="OT 참석 여부"
            name="otAttendance"
            value={form.otAttendance}
            onChange={setField("otAttendance")}
          />

          {/* 신입생 환영회 참석 여부 */}
          <AttendanceRadioGroup
            label="신입생 환영회 참석 여부"
            name="welcomePartyAttendance"
            value={form.welcomePartyAttendance}
            onChange={setField("welcomePartyAttendance")}
          />

          {/* 개인정보 동의 */}
          <PrivacyAgreement
            checked={form.privacyAgreed}
            onChange={setField("privacyAgreed")}
            errorMessage={errors.privacyAgreed}
          />

          {/* 제출 버튼 */}
          <div className="flex justify-end pt-2">
            <ShortBtn type="submit" disabled={Object.keys(validate(form)).length > 0}>
              지원하기
            </ShortBtn>
          </div>
        </form>
      </div>
    </main>
  );
}
