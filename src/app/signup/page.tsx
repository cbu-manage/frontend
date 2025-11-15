"use client";
import { useState } from "react";
import StepOne from "@/components/signup/StepOne";
import StepTwo from "@/components/signup/StepTwo";
import SignupCompleteModal from "@/components/signup/SignupCompleteModal";

export default function JoinPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center gap-2 mb-4">
          <div className={`h-3 w-3 rounded-full ${currentStep === 1 ? 'bg-zinc-900' : 'bg-zinc-300'}`} />
          <div className={`h-3 w-3 rounded-full ${currentStep === 2 ? 'bg-zinc-900' : 'bg-zinc-300'}`} />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-6">회원가입</h2>
        <div className="bg-white rounded-xl p-6 shadow">
          {currentStep === 1 ? (
            <StepOne
              onVerified={(data) => {
                setCurrentStep(2);
              }}
            />
          ) : (
            <StepTwo
              onCompleted={() => setShowModal(true)}
            />
          )}
        </div>
        <p className="mt-4 text-center text-sm text-zinc-600">
          지원 시 닉네임 기억이 나지 않는다면?&nbsp;
          <a className="font-semibold text-zinc-900" href="https://www.instagram.com/tukorea_cbu/#" target="_blank" rel="noopener noreferrer">합격자 발표 확인해보기 (클릭!)</a>
        </p>
      </div>
      <SignupCompleteModal open={showModal} onClose={() => setShowModal(false)} />
    </main>
  );
}


