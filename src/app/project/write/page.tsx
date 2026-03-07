import { Suspense } from "react";
import ProjectWriteClient from "./ProjectWriteClient";

export const dynamic = "force-dynamic";

export default function ProjectWritePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen px-65 bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">로딩 중...</p>
        </main>
      }
    >
      <ProjectWriteClient />
    </Suspense>
  );
}
