"use client";

import { useEffect, useState, useCallback } from "react";

type ServiceStatus = "ok" | "error" | "unknown" | "loading";

interface HealthData {
  frontend: {
    status: string;
    timestamp: string;
  };
  backend: {
    status: ServiceStatus;
    url: string;
    latencyMs: number | null;
    message: string | null;
  };
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const config: Record<ServiceStatus, { label: string; color: string; pulse: string; dot: string }> = {
    ok:      { label: "Operational",  color: "text-emerald-400", pulse: "bg-emerald-400/20", dot: "bg-emerald-400" },
    error:   { label: "Outage",       color: "text-red-400",     pulse: "bg-red-400/20",     dot: "bg-red-400"     },
    unknown: { label: "Unknown",      color: "text-yellow-400",  pulse: "bg-yellow-400/20",  dot: "bg-yellow-400"  },
    loading: { label: "Checking…",    color: "text-slate-400",   pulse: "bg-slate-400/20",   dot: "bg-slate-400"   },
  };

  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${c.pulse} ${c.color}`}>
      <span className="relative flex h-2 w-2">
        {status === "ok" && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.dot} opacity-60`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${c.dot}`} />
      </span>
      {c.label}
    </span>
  );
}

function LatencyBadge({ ms }: { ms: number | null }) {
  if (ms === null) return null;
  const color = ms < 300 ? "text-emerald-400" : ms < 800 ? "text-yellow-400" : "text-red-400";
  return (
    <span className={`text-xs font-mono font-semibold ${color}`}>
      {ms}ms
    </span>
  );
}

function ServiceCard({
  name,
  icon,
  status,
  latencyMs,
  detail,
  description,
}: {
  name: string;
  icon: string;
  status: ServiceStatus;
  latencyMs?: number | null;
  detail?: string | null;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 flex flex-col gap-4 hover:border-white/20 transition-all duration-300 hover:bg-white/8">
      {/* Glow */}
      <div
        className={`absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-10 ${
          status === "ok" ? "bg-emerald-400" : status === "error" ? "bg-red-400" : "bg-slate-400"
        }`}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
            {icon}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{name}</p>
            <p className="text-xs text-white/40">{description}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <span className="text-xs text-white/40 font-mono truncate max-w-[60%]">
          {detail ?? "—"}
        </span>
        {latencyMs !== undefined && <LatencyBadge ms={latencyMs} />}
      </div>
    </div>
  );
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);

  const fetchHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const json: HealthData = await res.json();
      setData(json);
      setLastChecked(new Date().toLocaleTimeString());
      setCountdown(30);
    } catch {
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  // Countdown ticker
  useEffect(() => {
    if (isLoading) return;
    const tick = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(tick);
  }, [isLoading]);

  const overallStatus: ServiceStatus = !data
    ? "loading"
    : data.backend.status === "ok"
    ? "ok"
    : data.backend.status === "error"
    ? "error"
    : "unknown";

  const overallLabel =
    overallStatus === "ok"
      ? "All Systems Operational"
      : overallStatus === "error"
      ? "Partial Outage Detected"
      : "Checking Systems…";

  const overallSubLabel =
    overallStatus === "ok"
      ? "All services are running normally."
      : overallStatus === "error"
      ? "One or more services are experiencing issues."
      : "Please wait while we check your services.";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-4 py-16">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-2xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="text-3xl">🛡️</div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            System Status
          </h1>
          <p className="text-white/40 text-sm">
            Genwrite — Real-time service health
          </p>
        </div>

        {/* Overall banner */}
        <div
          className={`rounded-2xl p-6 flex flex-col items-center gap-2 border text-center transition-all duration-500 ${
            overallStatus === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10"
              : overallStatus === "error"
              ? "border-red-500/30 bg-red-500/10"
              : "border-white/10 bg-white/5"
          }`}
        >
          <StatusBadge status={overallStatus} />
          <p className="text-lg font-semibold text-white mt-1">{overallLabel}</p>
          <p className="text-white/40 text-sm">{overallSubLabel}</p>
        </div>

        {/* Service cards */}
        <div className="flex flex-col gap-4">
          <p className="text-xs text-white/30 uppercase tracking-widest font-semibold px-1">
            Services
          </p>

          <ServiceCard
            name="Frontend"
            icon="⚡"
            status={data ? "ok" : "loading"}
            detail={data?.frontend.timestamp ? new Date(data.frontend.timestamp).toLocaleTimeString() : null}
            description="Next.js — Vercel"
          />

          <ServiceCard
            name="Backend API"
            icon="🚀"
            status={data ? data.backend.status : "loading"}
            latencyMs={data?.backend.latencyMs}
            detail={data?.backend.url}
            description="NestJS — Render"
          />

          <ServiceCard
            name="Redis Cache"
            icon="🗄️"
            status={
              data?.backend.status === "ok"
                ? "ok"
                : data?.backend.status === "error"
                ? "unknown"
                : "loading"
            }
            description="Redis — Render (via backend)"
            detail={
              data?.backend.status === "ok"
                ? "Connected through backend"
                : data?.backend.status === "error"
                ? "Status unknown — backend unreachable"
                : null
            }
          />
        </div>

        {/* Footer / refresh */}
        <div className="flex items-center justify-between text-xs text-white/30 border-t border-white/10 pt-4">
          <span>
            Last checked: <span className="text-white/50">{lastChecked ?? "—"}</span>
          </span>
          <div className="flex items-center gap-3">
            <span>Auto-refresh in {countdown}s</span>
            <button
              id="health-refresh-btn"
              onClick={fetchHealth}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? "Checking…" : "↻ Refresh"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
