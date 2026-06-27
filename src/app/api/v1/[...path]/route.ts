import { NextRequest, NextResponse } from "next/server";

const BACKEND = (process.env.BACKEND_URL ?? "").replace(/\/$/, "");

async function proxy(req: NextRequest) {
  if (!BACKEND) {
    return NextResponse.json({ error: "BACKEND_URL not configured" }, { status: 502 });
  }

  const { pathname, search } = req.nextUrl;
  const target = `${BACKEND}${pathname}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "origin" || lower === "referer") return;
    headers.set(key, value);
  });

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.arrayBuffer()
      : undefined;

  const res = await fetch(target, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  res.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "transfer-encoding") return;
    // fetch가 본문을 이미 압축 해제하므로 압축 관련 헤더는 제거
    // (안 떼면 브라우저가 재해제 시도 → ERR_CONTENT_DECODING_FAILED)
    if (lower === "content-encoding" || lower === "content-length") return;
    // Set-Cookie는 여러 줄일 수 있으므로 아래에서 별도 처리
    if (lower === "set-cookie") return;
    responseHeaders.set(key, value);
  });
  // 복수 Set-Cookie를 그대로 전달 (set이 아닌 append)
  for (const cookie of res.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", cookie);
  }

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
