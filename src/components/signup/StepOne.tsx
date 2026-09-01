"use client";
import { useState, useEffect } from "react";
import { FOREIGN_DOMAIN_NOTICE, parseSchoolEmailId } from "@/lib/email";
import { type UserInfo } from "@/hooks/user";
import { useValidateUser } from "@/hooks/user/useValidateUser";
import { useVerifyEmail } from "@/hooks/mail";
import InputBox from "../common/InputBox";
import { Button } from "@/components/ui/button";

export default function StepOne({
  onVerified,
}: {
  onVerified: (data: UserInfo, email: string) => void;
}) {
  const [studentNumber, setStudentNumber] = useState("");
  const [nickName, setNickName] = useState("");
  const [email, setEmail] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifiedUserInfo, setVerifiedUserInfo] = useState<UserInfo | null>(
    null,
  );
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const { validateUser } = useValidateUser();
  const {
    isSending,
    sendEmailToServer,
    verifyCodeWithServer,
    codeExpiresLabel,
  } = useVerifyEmail();

  const handleUserVerification = async () => {
    const result = await validateUser(studentNumber, nickName);
    if (result) {
      // 아직 로그인이 아니다. 전역 스토어에 넣으면 헤더가 로그인 상태로 바뀌고
      // 가입을 마치지 않고 나가도 개인정보가 localStorage에 남는다.
      setVerifiedUserInfo(result);
    }
  };

  const fullEmail = `${email}@tukorea.ac.kr`;

  const handleEmailSend = async () => {
    if (!verifiedUserInfo) {
      alert("먼저 합격자 인증을 완료해주세요.");
      return;
    }
    if (!email || isSending) return;
    const { success, responseMessage } = await sendEmailToServer(fullEmail);
    if (success) {
      alert("인증번호가 전송되었습니다.");
      setIsCodeSent(true);
      setCooldown(60);
    } else {
      alert(responseMessage);
    }
  };

  const handleCodeVerification = async () => {
    if (!verificationCode) {
      alert("인증번호를 입력해주세요.");
      return;
    }
    const result = await verifyCodeWithServer(fullEmail, verificationCode);
    if (!result.success) {
      // 서버가 "인증번호가 일치하지 않습니다" / "만료되었습니다"를 정확히 알려준다.
      // 이걸 안 띄우면 틀린 번호를 넣어도 화면에 아무 변화가 없다.
      alert(
        result.responseMessage ||
          "인증에 실패했습니다. 인증번호를 다시 확인해주세요.",
      );
      return;
    }
    if (!verifiedUserInfo) {
      alert(
        "합격자 인증 정보가 없습니다. 학번·닉네임 인증부터 다시 진행해주세요.",
      );
      return;
    }
    onVerified(verifiedUserInfo, fullEmail);
  };

  return (
    <div className="space-y-4">
      <InputBox
        label="학번"
        placeholder="학번을 입력하세요"
        value={studentNumber}
        onChange={(e) => setStudentNumber(e.target.value)}
        required
      />
      <div className="flex gap-4">
        <div className="flex-1">
          <InputBox
            label="지원 시 닉네임"
            placeholder="본인의 닉네임을 적어주세요"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            required
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="default"
            className="h-auto rounded-lg px-8 py-4 text-base font-medium"
            onClick={handleUserVerification}
            disabled={!studentNumber || !nickName}
          >
            합격자 인증
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div
          className="flex-1 space-y-1.5"
          onClick={() =>
            !verifiedUserInfo && alert("합격자 인증 뒤에 해주세요!")
          }
        >
          <label className="block text-sm font-medium text-gray-900">
            학교 이메일
          </label>
          <div
            className={`flex items-center rounded-lg border transition-all duration-150 ${
              !verifiedUserInfo
                ? "bg-gray-100 border-transparent cursor-not-allowed"
                : "bg-gray-50 border-transparent focus-within:bg-gray-0 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand"
            }`}
          >
            <input
              type="text"
              placeholder="이메일 아이디"
              value={email}
              onChange={(e) => {
                const { id, hasForeignDomain } = parseSchoolEmailId(
                  e.target.value,
                );
                setEmail(id);
                setEmailNotice(hasForeignDomain ? FOREIGN_DOMAIN_NOTICE : "");
              }}
              disabled={!verifiedUserInfo}
              className={`flex-1 px-4 py-[15px] text-base font-medium tracking-[-0.048px] leading-normal border-0 outline-none ring-0 shadow-none bg-transparent ${
                !verifiedUserInfo
                  ? "text-gray-500 placeholder:text-gray-400 cursor-not-allowed"
                  : "text-gray-900 placeholder:text-gray-600"
              }`}
            />
            <span
              className={`pr-4 text-base font-medium shrink-0 select-none ${
                !verifiedUserInfo ? "text-gray-400" : "text-gray-500"
              }`}
            >
              @tukorea.ac.kr
            </span>
          </div>
          {emailNotice && (
            <p className="mt-1.5 text-caption text-notice">{emailNotice}</p>
          )}
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="default"
            className="h-auto rounded-lg px-8 py-4 text-base font-medium"
            onClick={handleEmailSend}
            disabled={!verifiedUserInfo || !email || cooldown > 0 || isSending}
          >
            {cooldown > 0 ? `${cooldown}초 후 재전송` : "인증번호 받기"}
          </Button>
        </div>
      </div>

      {isCodeSent && (
        <div className="flex gap-4">
          <div className="flex-1">
            <InputBox
              label="인증번호"
              placeholder="인증번호를 입력하세요"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
            {codeExpiresLabel ? (
              <p className="text-caption text-gray-500">
                인증번호 유효시간 {codeExpiresLabel}
              </p>
            ) : (
              <p className="text-caption text-notice">
                인증번호가 만료됐어요. 다시 받아주세요.
              </p>
            )}
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="default"
              className="h-auto rounded-lg px-8 py-4 text-base font-medium"
              onClick={handleCodeVerification}
              disabled={!verificationCode}
            >
              인증하기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
