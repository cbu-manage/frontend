// /user 페이지는 로그인 상태 등 런타임 정보에 의존하므로
// 정적 프리렌더링 대신 항상 동적 렌더링하도록 설정
export const dynamic = "force-dynamic";

import UserPageClient from "@/components/user/UserPageClient";

export default function UserPage() {
  return <UserPageClient />;
}
