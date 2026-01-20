"use client";
import { useState } from "react";
import StepOne from "@/components/signup/StepOne";
import StepTwo from "@/components/signup/StepTwo";
import SignupCompleteModal from "@/components/signup/SignupCompleteModal";

export default function JoinPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  return (
    <main
      className="flex items-center justify-center min-h-screen"
      style={{ background: "var(--color-gray-0)" }}
    >
      <div className="w-full max-w-xl">
        <div className="flex justify-center gap-2 mb-10">
          <div className={`h-2.5 w-2.5 rounded-full ${currentStep === 1 ? 'bg-brand' : 'bg-gray-200'}`} />
          <div className={`h-2.5 w-2.5 rounded-full ${currentStep === 2 ? 'bg-brand' : 'bg-gray-200'}`} />
        </div>
        <h2 className="text-2xl font-semibold font-medium text-gray-900 text-center mb-6">회원가입</h2>
        <div>
          {currentStep === 1 ? (
            <StepOne
              onVerified={(_, email) => {
                setVerifiedEmail(email);
                setCurrentStep(2);
              }}
            />
          ) : (
            <StepTwo
              email={verifiedEmail}
              onCompleted={() => setShowModal(true)}
            />
          )}
        </div>
        {currentStep === 1 && (
          <p className="mt-6 text-center text-sm text-gray-600">
            지원 시 닉네임 기억이 나지 않는다면?&nbsp;
            <a
              className="font-semibold text-gray-900"
              href="https://www.instagram.com/tukorea_cbu/#"
              target="_blank"
              rel="noopener noreferrer"
            >
              합격자 발표 확인해보기 (클릭!)
            </a>
          </p>
        )}
      </div>
      <SignupCompleteModal open={showModal} onClose={() => setShowModal(false)} />
    </main>
  );
}


