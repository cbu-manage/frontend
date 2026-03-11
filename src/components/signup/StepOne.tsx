"use client";
import { useState, useEffect } from "react";
import { type UserInfo } from "@/hooks/user";
import { useValidateUser } from "@/hooks/user/useValidateUser";
import { useVerifyEmail } from "@/hooks/mail";
import { useUserStore } from "@/store/userStore";
import InputBox from "../common/InputBox";
import ShortBtn from "../common/ShortBtn";

export default function StepOne({
  onVerified,
}: {
  onVerified: (data: UserInfo, email: string) => void;
}) {
  const [studentNumber, setStudentNumber] = useState("");
  const [nickName, setNickName] = useState("");
  const [email, setEmail] = useState("");
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
  const { sendEmailToServer, verifyCodeWithServer } = useVerifyEmail();
  const setUser = useUserStore((s) => s.setUser);

  const handleUserVerification = async () => {
    const result = await validateUser(studentNumber, nickName);
    if (result) {
      setVerifiedUserInfo(result);
      setUser(result);
    }
  };

  const fullEmail = `${email}@tukorea.ac.kr`;

  const handleEmailSend = async () => {
    if (!verifiedUserInfo) {
      alert("먼저 합격자 인증을 완료해주세요.");
      return;
    }
    if (!email) {
      alert("이메일을 입력해주세요.");
      return;
    }
    const success = await sendEmailToServer(fullEmail);
    if (success) {
      alert("인증번호가 전송되었습니다.");
      setIsCodeSent(true);
      setCooldown(60);
    }
  };

  const handleCodeVerification = async () => {
    if (!verificationCode) {
      alert("인증번호를 입력해주세요.");
      return;
    }
    const result = await verifyCodeWithServer(fullEmail, verificationCode);
    if (result.success && verifiedUserInfo) {
      onVerified(verifiedUserInfo, fullEmail);
    }
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
          <ShortBtn
            type="button"
            onClick={handleUserVerification}
            disabled={!studentNumber || !nickName}
          >
            합격자 인증
          </ShortBtn>
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
              onChange={(e) => setEmail(e.target.value.replace(/@.*$/, ""))}
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
        </div>
        <div className="flex items-end">
          <ShortBtn
            type="button"
            onClick={handleEmailSend}
            disabled={!verifiedUserInfo || !email || cooldown > 0}
          >
            {cooldown > 0 ? `${cooldown}초 후 재전송` : "인증번호 받기"}
          </ShortBtn>
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
          </div>
          <div className="flex items-end">
            <ShortBtn
              type="button"
              onClick={handleCodeVerification}
              disabled={!verificationCode}
            >
              인증하기
            </ShortBtn>
          </div>
        </div>
      )}
    </div>
  );
}
