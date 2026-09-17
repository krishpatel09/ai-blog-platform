import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const result = {
    frontend: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    backend: {
      status: "unknown" as "ok" | "error" | "unknown",
      url: backendUrl ?? "not configured",
      latencyMs: null as number | null,
      message: null as string | null,
    },
  };

  if (!backendUrl) {
    result.backend.status = "error";
    result.backend.message = "NEXT_PUBLIC_API_BASE_URL is not configured";
    return NextResponse.json(result, { status: 200 });
  }

  const start = Date.now();
  try {
    const response = await fetch(`${backendUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    result.backend.latencyMs = Date.now() - start;

    if (response.ok) {
      result.backend.status = "ok";
      result.backend.message = await response.text();
    } else {
      result.backend.status = "error";
      result.backend.message = `HTTP ${response.status}`;
    }
  } catch (err: any) {
    result.backend.latencyMs = Date.now() - start;
    result.backend.status = "error";
    result.backend.message = err?.message ?? "Unreachable";
  }

  const overallStatus = result.backend.status === "ok" ? 200 : 503;
  return NextResponse.json(result, { status: overallStatus });
}
