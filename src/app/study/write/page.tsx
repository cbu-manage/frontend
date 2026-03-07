import { Suspense } from "react";
import StudyWriteClient from "./StudyWriteClient";

export const dynamic = "force-dynamic";

export default function StudyWritePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen px-65 bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">로딩 중...</p>
        </main>
      }
    >
      <StudyWriteClient />
    </Suspense>
  );
}
