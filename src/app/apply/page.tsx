import { Suspense } from "react";
import ApplyIntroClient from "./ApplyIntroClient";

export const metadata = {
  title: "가입 신청 | 씨부엉",
  description: "씨부엉 신규 부원 모집 안내 및 제출 확인",
};

export default function ApplyIntroPage() {
  return (
    <Suspense fallback={null}>
      <ApplyIntroClient />
    </Suspense>
  );
}
