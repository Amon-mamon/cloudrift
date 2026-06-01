"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────
interface ApiKey {
  id: number;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  permissions: string[];
  status: "active" | "revoked";
}

// ─── Mock Data ────────────────────────────────────────────
const API_KEYS: ApiKey[] = [
  {
    id: 1,
    name: "Production App",
    key: "cr_live_4xK9mP2nQrT8vYzA1bCdEfGhIjKlMnO",
    created: "Oct 12, 2025",
    lastUsed: "2 minutes ago",
    permissions: ["read", "write", "share"],
    status: "active",
  },
  {
    id: 2,
    name: "CI/CD Pipeline",
    key: "cr_live_7wRsUvXyZ3aBcDeF6gHiJkLmNoPqRsT",
    created: "Sep 5, 2025",
    lastUsed: "1 hour ago",
    permissions: ["read"],
    status: "active",
  },
  {
    id: 3,
    name: "Local Dev",
    key: "cr_test_9uVwXyZaB1cDeFgH2iJkLmNoPqRsTuV",
    created: "Aug 20, 2025",
    lastUsed: "3 days ago",
    permissions: ["read", "write"],
    status: "active",
  },
  {
    id: 4,
    name: "Old Integration",
    key: "cr_live_2kLmNoPqRsTuVwXyZ3aBcDeFgHiJkLm",
    created: "Jun 1, 2025",
    lastUsed: "2 months ago",
    permissions: ["read"],
    status: "revoked",
  },
];

const PERM_STYLE: Record<string, string> = {
  read:   "bg-blue-500/10 text-blue-300 border-blue-500/20",
  write:  "bg-amber-500/10 text-amber-300 border-amber-500/20",
  share:  "bg-violet-500/10 text-violet-300 border-violet-500/20",
  delete: "bg-red-500/10 text-red-300 border-red-500/20",
};

const ENDPOINTS = [
  { method: "GET",    path: "/v1/files",              desc: "List all your files"                          },
  { method: "GET",    path: "/v1/files/:id",          desc: "Get a specific file by ID"                   },
  { method: "POST",   path: "/v1/files/upload",       desc: "Upload a new database file"                  },
  { method: "DELETE", path: "/v1/files/:id",          desc: "Delete a file permanently"                   },
  { method: "GET",    path: "/v1/projects",           desc: "List all projects (folders)"                 },
  { method: "POST",   path: "/v1/projects",           desc: "Create a new project folder"                 },
  { method: "GET",    path: "/v1/projects/:id/files", desc: "List files inside a project"                 },
  { method: "POST",   path: "/v1/share",              desc: "Share a file with a team member"             },
  { method: "POST",   path: "/v1/ai/analyze",         desc: "Run AI DB Analyzer on a file"                },
  { method: "POST",   path: "/v1/ai/query",           desc: "Run Query Assistant on a schema"             },
  { method: "POST",   path: "/v1/ai/diff",            desc: "Run Schema Diff between two files"           },
];

const METHOD_STYLE: Record<string, string> = {
  GET:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  POST:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
  PATCH:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

// ─── Component ────────────────────────────────────────────
const Content = () => {
  const [keys, setKeys] = useState<ApiKey[]>(API_KEYS);
  const [visibleKey, setVisibleKey] = useState<number | null>(null);
  const [tab, setTab] = useState<"keys" | "docs">("keys");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const maskKey = (key: string) =>
    key.slice(0, 12) + "•".repeat(24) + key.slice(-4);

  const copyKey = (key: string, id: number) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const revokeKey = (id: number) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k))
    );
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-[#e8edf5] font-sans">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute w-125 h-125 rounded-full opacity-20 blur-[90px] bg-blue-600" style={{ top: "-120px", left: "140px" }} />
        <div className="absolute w-90 h-90 rounded-full opacity-15 blur-[80px] bg-emerald-600" style={{ top: "60px", right: "-60px" }} />
        <div className="absolute w-65 h-65 rounded-full opacity-10 blur-[70px] bg-violet-700" style={{ bottom: "60px", left: "45%" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(56,138,221,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56,138,221,0.05) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      <div className="relative z-10 p-8 w-full">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#f0f4fa] tracking-[-1px] mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
              API Access
            </h1>
            <p className="text-sm text-white/40 font-light">
              Manage API keys and explore the CloudRift API
            </p>
          </div>
          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 transition-all hover:-translate-y-0.5 text-white text-sm font-medium px-4 py-2.5 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Generate new key
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Active keys",    value: keys.filter((k) => k.status === "active").length.toString(),   icon: "bg-emerald-500/10 text-emerald-400", iconSvg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg> },
            { label: "Total API calls", value: "2,847",                                                      icon: "bg-blue-500/10 text-blue-400",     iconSvg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
            { label: "Endpoints",      value: ENDPOINTS.length.toString(),                                   icon: "bg-violet-500/10 text-violet-400", iconSvg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg> },
          ].map((s) => (
            <div key={s.label} className="group bg-white/3 border border-white/8 hover:border-blue-500/30 hover:bg-blue-500/4 rounded-xl p-4 transition-all cursor-default">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${s.icon}`}>{s.iconSvg}</div>
              <div className="text-2xl font-bold text-[#f0f4fa] mb-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
              <div className="text-[11px] text-white/35">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-white/3 border border-white/8 rounded-xl p-1 gap-1 w-fit mb-6">
          {(["keys", "docs"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                tab === t
                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/2"
                  : "text-white/35 hover:text-white/60"
              }`}
            >
              {t === "keys" ? "API Keys" : "Endpoints"}
            </button>
          ))}
        </div>

        {/* ── API KEYS TAB ──────────────────────────────── */}
        {tab === "keys" && (
          <div className="space-y-3">
            {/* Base URL info */}
            <div className="flex items-center gap-3 bg-blue-500/[0.07] border border-blue-500/15 rounded-xl px-4 py-3 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <span className="text-xs text-blue-300/80">Base URL:</span>
              <code className="text-xs text-blue-300 font-mono bg-blue-500/10 px-2 py-0.5 rounded-md">https://api.cloudrift.io/v1</code>
              <span className="text-xs text-white/25 ml-auto">Include your API key in the <code className="text-blue-300/70 font-mono">Authorization: Bearer</code> header</span>
            </div>

            {keys.map((apiKey) => (
              <div
                key={apiKey.id}
                className={`bg-white/3 border rounded-xl p-5 transition-all ${
                  apiKey.status === "revoked"
                    ? "border-white/5 opacity-50"
                    : "border-white/8 hover:border-white/[0.14]"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white/80" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {apiKey.name}
                        </span>
                        <span className={`text-[9px] font-medium border rounded-full px-2 py-0.5 ${
                          apiKey.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {apiKey.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-white/25 mt-0.5">
                        Created {apiKey.created} · Last used {apiKey.lastUsed}
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="flex items-center gap-1.5">
                    {apiKey.permissions.map((p) => (
                      <span key={p} className={`text-[9px] font-medium border rounded-full px-2 py-0.5 capitalize ${PERM_STYLE[p]}`}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key display */}
                <div className="flex items-center gap-2 bg-black/20 border border-white/[0.07] rounded-lg px-3 py-2.5">
                  <code className="flex-1 text-[11px] text-white/45 font-mono truncate">
                    {visibleKey === apiKey.id ? apiKey.key : maskKey(apiKey.key)}
                  </code>
                  <button
                    onClick={() => setVisibleKey(visibleKey === apiKey.id ? null : apiKey.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-white/25 hover:text-white/55 transition-colors shrink-0"
                  >
                    {visibleKey === apiKey.id ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" x2="23" y1="1" y2="23"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                  <button
                    onClick={() => copyKey(apiKey.key, apiKey.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-white/25 hover:text-white/55 transition-colors shrink-0"
                  >
                    {copiedId === apiKey.id ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    )}
                  </button>
                </div>

                {/* Revoke */}
                {apiKey.status === "active" && (
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => revokeKey(apiKey.id)}
                      className="text-[10px] text-red-400/60 hover:text-red-400 bg-red-500/6 hover:bg-red-500/12 border border-red-500/15 rounded-lg px-2.5 py-1 transition-all"
                    >
                      Revoke key
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── ENDPOINTS TAB ─────────────────────────────── */}
        {tab === "docs" && (
          <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[100px_220px_1fr] gap-4 px-5 py-3 border-b border-white/[0.07]">
              {["Method", "Endpoint", "Description"].map((h) => (
                <span key={h} className="text-[10px] font-medium text-white/20 uppercase tracking-wider">{h}</span>
              ))}
            </div>
            {ENDPOINTS.map((ep, i) => (
              <div key={i} className="grid grid-cols-[100px_220px_1fr] gap-4 items-center px-5 py-3.5 hover:bg-white/3 border-b border-white/4 last:border-0 transition-colors group">
                <span className={`text-[10px] font-bold border rounded-md px-2 py-1 w-fit font-mono ${METHOD_STYLE[ep.method]}`}>
                  {ep.method}
                </span>
                <code className="text-xs text-white/55 font-mono group-hover:text-white/80 transition-colors truncate">
                  {ep.path}
                </code>
                <span className="text-xs text-white/35">{ep.desc}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Content;