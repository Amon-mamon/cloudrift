"use client";

import { CustomButton } from "@/components/reusable/button/CustomButton";
import { authFetch } from "@/lib/auth-fetch";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

const STATS = [
  {
    label: "Total Files",
    value: "128",
    sub: "+12 this week",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      </svg>
    ),
    iconBg: "bg-blue-500/10 text-blue-400",
    trend: "up",
  },
  {
    label: "Storage Used",
    value: "4.2 GB",
    sub: "of 10 GB free plan",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      </svg>
    ),
    iconBg: "bg-emerald-500/10 text-emerald-400",
    trend: "neutral",
  },
  {
    label: "Shared Files",
    value: "24",
    sub: "with 6 people",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    iconBg: "bg-violet-500/10 text-violet-400",
    trend: "up",
  },
  {
    label: "AI Summaries",
    value: "37",
    sub: "files analyzed",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
    iconBg: "bg-amber-500/10 text-amber-400",
    trend: "up",
  },
];

type DashboardSummary = {
  stats: {
    projectCount: number;
    fileCount: number;
    sharedWithMeCount: number;
    aiAnalyzedCount: number;
    storageBytes: string;
  };
  recentFiles: Array<{
    id: string;
    name: string;
    type: string;
    sizeBytes: string | null;
    updatedAt: string;
    aiAnalyzed: boolean;
  }>;
};

const FILE_ICON: Record<string, string> = {
  SQL: "bg-blue-500/10 text-blue-400",
  DB: "bg-violet-500/10 text-violet-400",
  CSV: "bg-emerald-500/10 text-emerald-400",
  JSON: "bg-amber-500/10 text-amber-400",
  DUMP: "bg-red-500/10 text-red-400",
  ENV: "bg-zinc-500/10 text-zinc-400",
  SQLITE: "bg-cyan-500/10 text-cyan-400",
  OTHER: "bg-white/10 text-white/45",
};

function formatBytes(bytes?: string | null) {
  const value = Number(bytes ?? 0);

  if (!Number.isFinite(value) || value <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  const size = value / 1024 ** index;

  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatRelativeDate(dateValue: string) {
  const date = new Date(dateValue);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs)) return "Recently";

  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getDisplayName(user: User | null | undefined) {
  if (!user) return "there";

  const firstName =
    typeof user.user_metadata?.first_name === "string"
      ? user.user_metadata.first_name
      : "";
  const lastName =
    typeof user.user_metadata?.last_name === "string"
      ? user.user_metadata.last_name
      : "";
  const metadataName =
    typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "";

  return (
    [firstName, lastName].filter(Boolean).join(" ") ||
    metadataName ||
    user.email?.split("@")[0] ||
    "there"
  );
}

const Content = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("there");

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      try {
        const response = await authFetch("/api/dashboard/summary");

        if (!response.ok) return;

        const data = (await response.json()) as DashboardSummary;
        if (mounted) setSummary(data);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadSummary();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (mounted) setDisplayName(getDisplayName(data.user));
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setDisplayName(getDisplayName(session?.user));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const stats = useMemo(() => {
    const values = summary?.stats;

    return STATS.map((stat) => {
      if (stat.label === "Total Files") {
        return {
          ...stat,
          value: isLoading ? "..." : String(values?.fileCount ?? 0),
          sub: `${values?.projectCount ?? 0} projects`,
        };
      }

      if (stat.label === "Storage Used") {
        return {
          ...stat,
          value: isLoading ? "..." : formatBytes(values?.storageBytes),
          sub: "across your files",
        };
      }

      if (stat.label === "Shared Files") {
        return {
          ...stat,
          value: isLoading ? "..." : String(values?.sharedWithMeCount ?? 0),
          sub: "shared with you",
        };
      }

      return {
        ...stat,
        value: isLoading ? "..." : String(values?.aiAnalyzedCount ?? 0),
        sub: "files analyzed",
      };
    });
  }, [isLoading, summary]);

  const recentFiles = useMemo(
    () =>
      summary?.recentFiles.map((file) => ({
        name: file.name,
        ext: file.type,
        size: formatBytes(file.sizeBytes),
        modified: formatRelativeDate(file.updatedAt),
        iconColor: FILE_ICON[file.type] ?? FILE_ICON.OTHER,
        ai: file.aiAnalyzed,
      })) ?? [],
    [summary],
  );

  const aiActivity = recentFiles
    .filter((file) => file.ai)
    .map((file, index) => ({
      file: file.name,
      action: "Analyzed with AI tools",
      time: file.modified,
      dot: ["bg-blue-400", "bg-emerald-400", "bg-amber-400"][index % 3],
    }));

  return (
    <div className="min-h-screen bg-[#070b14] text-[#e8edf5] font-sans w-full pt-4">
      {/* Background — same orbs + grid as hero */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 w-full">
        <div
          className="absolute w-125 h-125 rounded-full opacity-20 blur-[90px] bg-blue-600"
          style={{ top: "-120px", left: "140px" }}
        />
        <div
          className="absolute w-90 h-90 rounded-full opacity-15 blur-[80px] bg-emerald-600"
          style={{ top: "60px", right: "-60px" }}
        />
        <div
          className="absolute w-65 h-65 rounded-full opacity-10 blur-[70px] bg-violet-700"
          style={{ bottom: "60px", left: "45%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(56,138,221,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56,138,221,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 p-8">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8 w-full">
          <div>
            <h1
              className="text-4xl font-extrabold text-[#f0f4fa] tracking-[-1px] mb-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Hello, {displayName}
            </h1>
            <p className="text-sm text-white/40 font-light">
              Here&apos;s what&apos;s happening in your CloudRift today.
            </p>
          </div>
        </div>

        {/* Stat cards — same card style as hero stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group bg-white/3 border border-white/8 hover:border-blue-500/30 hover:bg-blue-500/4 rounded-xl p-4 transition-all cursor-default"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.iconBg}`}
                >
                  {stat.icon}
                </div>
                {stat.trend === "up" && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-1.5 py-0.5">
                    ↑ Up
                  </span>
                )}
              </div>
              <div
                className="text-2xl font-bold text-[#f0f4fa] mb-0.5"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {stat.value}
              </div>
              <div className="text-[11px] text-white/35">{stat.label}</div>
              <div className="text-[10px] text-white/22 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent files — same card style as hero mockup */}
          <div className="lg:col-span-2 bg-white/3 border border-white/8 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
              <h2
                className="text-sm font-semibold text-white/60"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Recent Files
              </h2>
              <button className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                View all →
              </button>
            </div>

            <div className="divide-y divide-white/5">
              {recentFiles.length === 0 && (
                <div className="px-5 py-10 text-center text-xs text-white/25">
                  No files yet for this account.
                </div>
              )}
              {recentFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors group"
                >
                  {/* Same file icon style as hero mockup */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${file.iconColor}`}
                  >
                    {file.ext}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white/70 truncate group-hover:text-white/90 transition-colors">
                      {file.name}
                    </div>
                    <div className="text-[10px] text-white/25 mt-0.5">
                      {file.modified} · {file.size}
                    </div>
                  </div>
                  {/* AI tag — same as hero */}
                  {file.ai && (
                    <span className="text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5 shrink-0">
                      AI Summary
                    </span>
                  )}
                  {/* Hover actions */}
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button className="w-6 h-6 flex items-center justify-center rounded-md bg-white/6 hover:bg-white/10 text-white/35 hover:text-white/65 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                    </button>
                    <button className="w-6 h-6 flex items-center justify-center rounded-md bg-white/6 hover:bg-white/10 text-white/35 hover:text-white/65 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" x2="12" y1="2" y2="15" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Storage card — same as hero stats card */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-4">
              <h2
                className="text-sm font-semibold text-white/60 mb-3"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Storage
              </h2>
              <div className="flex items-end justify-between mb-2">
                <span
                  className="text-2xl font-bold text-[#f0f4fa]"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {isLoading ? "..." : formatBytes(summary?.stats.storageBytes)}
                </span>
                <span className="text-xs text-white/25">of 10 GB</span>
              </div>
              <div className="h-1 bg-white/8 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: summary?.stats.storageBytes
                      ? `${Math.min((Number(summary.stats.storageBytes) / (10 * 1024 * 1024 * 1024)) * 100, 100)}%`
                      : "0%",
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: "Docs", pct: "18%", color: "bg-blue-400" },
                  { label: "Images", pct: "12%", color: "bg-emerald-400" },
                  { label: "Other", pct: "12%", color: "bg-amber-400" },
                ].map((t) => (
                  <div key={t.label} className="text-center">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${t.color} mx-auto mb-1`}
                    />
                    <div className="text-[10px] text-white/30">{t.label}</div>
                    <div className="text-[11px] font-medium text-white/50">
                      {t.pct}
                    </div>
                  </div>
                ))}
              </div>
              {/* Matches hero secondary button */}
              <CustomButton
                tooltip="Uprade"
                className="w-full text-[11px] font-medium text-blue-400 hover:text-blue-300 bg-blue-500/8 hover:bg-blue-500/[0.14] border border-blue-500/20 rounded-xl py-2 transition-all"
              >
                Upgrade to Pro ↑
              </CustomButton>
            </div>

            {/* AI Activity — uses hero AI badge colors */}
            <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden flex-1">
              <div className="flex items-center gap-2 px-4 py-4 border-b border-white/[0.07]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
                <h2
                  className="text-sm font-semibold text-white/60"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  AI Activity
                </h2>
              </div>
              <div className="p-3 space-y-1">
                {aiActivity.length === 0 && (
                  <div className="p-4 text-xs text-white/25">
                    No AI activity yet.
                  </div>
                )}
                {aiActivity.map((item) => (
                  <div
                    key={item.file}
                    className="flex gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-colors group cursor-default"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${item.dot} mt-1.5 shrink-0`}
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-white/55 truncate group-hover:text-white/75 transition-colors">
                        {item.file}
                      </div>
                      <div className="text-[10px] text-white/28 mt-0.5 leading-relaxed">
                        {item.action}
                      </div>
                      <div className="text-[9px] text-white/18 mt-1">
                        {item.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;
