import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

const BACKEND = serverEnv.backendUrl;

/**
 * 백엔드가 발송 제한을 사용자 단위로 걸 수 있도록 브라우저 IP를 넘긴다.
 * BFF를 거치면 백엔드에는 Vercel IP만 보여서 모든 사용자가 한 명으로 묶인다.
 * 브라우저가 직접 이 헤더를 넣어 보낼 수 있으므로 프록시에서 지우고 다시 채운다.
 */
const CLIENT_IP_HEADER = "x-client-ip";
const PROXY_SECRET_HEADER = "x-proxy-secret";

function clientIpOf(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() ?? "";
}

async function proxy(req: NextRequest) {
  if (!BACKEND) {
    return NextResponse.json(
      { error: "BACKEND_URL is not configured or is not an https URL" },
      { status: 502 },
    );
  }

  const { pathname, search } = req.nextUrl;
  const target = `${BACKEND}${pathname}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "origin" || lower === "referer") return;
    if (lower === CLIENT_IP_HEADER || lower === PROXY_SECRET_HEADER) return;
    headers.set(key, value);
  });

  const clientIp = clientIpOf(req);
  if (serverEnv.proxySecret && clientIp) {
    headers.set(CLIENT_IP_HEADER, clientIp);
    headers.set(PROXY_SECRET_HEADER, serverEnv.proxySecret);
  }

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
