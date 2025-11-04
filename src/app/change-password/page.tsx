"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const userStore = useUserStore();
  const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

  const isPasswordValid = useMemo(() => {
    const lengthValid = newPassword.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasDigit = /\d/.test(newPassword);
    const hasSpecialChar = /[^a-zA-Z\d]/.test(newPassword);
    return lengthValid && ((hasLetter && hasDigit) || (hasLetter && hasSpecialChar) || (hasDigit && hasSpecialChar));
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || newPassword !== confirmPassword) {
      alert("비밀번호 조건을 확인해주세요.");
      return;
    }
    try {
      const resp = await fetch(`${SERVER_URL}/login/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          studentNumber: userStore.studentNumber,
          password: newPassword,
        }),
      });
      if (resp.ok) {
        alert("비밀번호 변경 완료!");
        router.push("/login");
      } else {
        alert(`오류 발생: 비밀번호 변경 실패 (Status: ${resp.status})`);
      }
    } catch (e) {
      alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-xl shadow">
        <h2 className="text-xl font-bold text-center mb-2">비밀번호 변경 안내</h2>
        <p className="text-center text-sm text-zinc-600 mb-6">보안을 위해 비밀번호를 변경해주세요.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium mb-1">새 비밀번호</label>
            <input
              className="w-full rounded-lg border px-3 py-2 outline-none pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="새 비밀번호 입력"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-8 text-sm text-zinc-600"
            >
              {showPassword ? "숨김" : "표시"}
            </button>
            <small className="block text-xs text-zinc-500 mt-1">🔹 8자 이상, 영어+숫자+특수문자 중 2개 이상 포함</small>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium mb-1">새 비밀번호 확인</label>
            <input
              className="w-full rounded-lg border px-3 py-2 outline-none pr-10"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-8 text-sm text-zinc-600"
            >
              {showConfirmPassword ? "숨김" : "표시"}
            </button>
          </div>
          <button
            type="submit"
            disabled={!isPasswordValid || newPassword !== confirmPassword}
            className="w-full rounded-xl bg-[#95C674] text-white py-3 font-semibold disabled:bg-zinc-300 disabled:cursor-not-allowed"
          >
            비밀번호 변경
          </button>
        </form>
      </div>
    </main>
  );
}


