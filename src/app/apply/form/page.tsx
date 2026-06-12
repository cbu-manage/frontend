import { Suspense } from "react";
import ApplyFormClient from "./ApplyFormClient";

export const metadata = {
  title: "가입 신청서 | 씨부엉",
  description: "씨부엉 신규 부원 가입 신청서",
};

export default function ApplyPage() {
  return (
    <Suspense fallback={null}>
      <ApplyFormClient />
    </Suspense>
  );
}
