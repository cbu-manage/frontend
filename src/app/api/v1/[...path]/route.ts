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
    responseHeaders.set(key, value);
  });

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
