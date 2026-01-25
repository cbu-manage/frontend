"use client";
import { useState } from "react";
import { useVerifyUser, type UserInfo } from "@/hooks/useVerifyUser";
import { useVerifyEmail } from "@/hooks/useVerifyEmail";
import { useUserStore } from "@/store/userStore";
import InputBox from "../common/InputBox";
import ShortBtn from "../common/ShortBtn";

export default function StepOne({ onVerified }: { onVerified: (data: UserInfo, email: string) => void }) {
  const [studentNumber, setStudentNumber] = useState("");
  const [nickName, setNickName] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifiedUserInfo, setVerifiedUserInfo] = useState<UserInfo | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);

  const { verifyUser } = useVerifyUser();
  const { sendEmailToServer, verifyCodeWithServer } = useVerifyEmail();
  const setUser = useUserStore((s) => s.setUser);

  const handleUserVerification = async () => {
    const result = await verifyUser(studentNumber, nickName);
    if (result) {
      setVerifiedUserInfo(result);
      setUser(result);
    }
  };

  const handleEmailSend = async () => {
    if (!verifiedUserInfo) {
      alert("먼저 합격자 인증을 완료해주세요.");
      return;
    }
    if (!email) {
      alert("이메일을 입력해주세요.");
      return;
    }
    const success = await sendEmailToServer(email);
    if (success) {
      alert("인증번호가 전송되었습니다.");
      setIsCodeSent(true);
    }
  };

  const handleCodeVerification = async () => {
    if (!verificationCode) {
      alert("인증번호를 입력해주세요.");
      return;
    }
    const result = await verifyCodeWithServer(email, verificationCode);
    if (result.success && verifiedUserInfo) {
      onVerified(verifiedUserInfo, email);
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
          className="flex-1"
          onClick={() => !verifiedUserInfo && alert("합격자 인증 뒤에 해주세요!")}
        >
          <InputBox
            label="학교 이메일"
            placeholder="학교 이메일을 입력해주세요."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={!verifiedUserInfo}
            className={!verifiedUserInfo ? "pointer-events-none" : ""}
          />
        </div>
        <div className="flex items-end">
          <ShortBtn
            type="button"
            onClick={handleEmailSend}
            disabled={!verifiedUserInfo || !email}
          >
            인증번호 받기
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
