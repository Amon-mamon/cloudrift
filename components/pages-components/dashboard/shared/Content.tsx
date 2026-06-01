"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────
interface SharedPerson {
  initials: string;
  name: string;
  color: string;
  fileCount: number;
  lastActive: string;
  role: string;
  permission: "Full access" | "Read only";
}

interface SharedFile {
  name: string;
  type: "SQL" | "DB" | "CSV" | "JSON" | "DUMP" | "ENV" | "SQLITE";
  engine?: string;
  from: string;
  project: string;
  modified: string;
  size: string;
  ai?: boolean;
  permission: "Full access" | "Read only";
}

// ─── Mock Data ────────────────────────────────────────────
const PEOPLE: SharedPerson[] = [
  { initials: "MA", name: "Maria Andres",   color: "bg-blue-600",    fileCount: 8,  lastActive: "2 hours ago",  role: "Backend Dev",     permission: "Full access" },
  { initials: "RB", name: "Ramon Bautista", color: "bg-amber-600",   fileCount: 4,  lastActive: "1 day ago",    role: "DB Admin",        permission: "Read only"   },
  { initials: "KL", name: "Krista Lim",     color: "bg-violet-600",  fileCount: 12, lastActive: "3 days ago",   role: "Lead Developer",  permission: "Full access" },
  { initials: "TN", name: "Troy Navarro",   color: "bg-red-600",     fileCount: 3,  lastActive: "1 week ago",   role: "DevOps",          permission: "Read only"   },
  { initials: "SA", name: "Sofia Aquino",   color: "bg-emerald-600", fileCount: 6,  lastActive: "2 weeks ago",  role: "Backend Dev",     permission: "Full access" },
  { initials: "JM", name: "Jake Mendoza",   color: "bg-pink-600",    fileCount: 1,  lastActive: "1 month ago",  role: "QA Engineer",     permission: "Read only"   },
];

const FILES: SharedFile[] = [
  { name: "ecommerce_schema_v4.sql",   type: "SQL",    engine: "PostgreSQL", from: "Maria Andres",   project: "E-Commerce Platform",  modified: "2 hours ago",  size: "84 KB",  ai: true,  permission: "Full access" },
  { name: "users_schema.sql",          type: "SQL",    engine: "MySQL",      from: "Krista Lim",     project: "Auth Service",         modified: "1 day ago",    size: "32 KB",  ai: true,  permission: "Read only"   },
  { name: "products_export.csv",       type: "CSV",                          from: "Krista Lim",     project: "E-Commerce Platform",  modified: "3 days ago",   size: "5.4 MB", ai: false, permission: "Full access" },
  { name: "auth_backup.dump",          type: "DUMP",   engine: "MySQL",      from: "Ramon Bautista", project: "Auth Service",         modified: "1 week ago",   size: "8.6 MB", ai: false, permission: "Read only"   },
  { name: "analytics_config.json",     type: "JSON",                         from: "Ramon Bautista", project: "Analytics Dashboard",  modified: "1 week ago",   size: "240 KB", ai: false, permission: "Read only"   },
  { name: "inventory_schema.sql",      type: "SQL",    engine: "MySQL",      from: "Sofia Aquino",   project: "Inventory System",     modified: "2 weeks ago",  size: "48 KB",  ai: true,  permission: "Full access" },
  { name: "app_local.sqlite",          type: "SQLITE", engine: "SQLite",     from: "Troy Navarro",   project: "Mobile App Backend",   modified: "1 month ago",  size: "4.8 MB", ai: true,  permission: "Read only"   },
];

// ─── Helpers ──────────────────────────────────────────────
const FILE_ICON: Record<string, string> = {
  SQL:    "bg-blue-500/10 text-blue-400",
  DB:     "bg-violet-500/10 text-violet-400",
  CSV:    "bg-emerald-500/10 text-emerald-400",
  JSON:   "bg-amber-500/10 text-amber-400",
  DUMP:   "bg-red-500/10 text-red-400",
  ENV:    "bg-zinc-500/10 text-zinc-400",
  SQLITE: "bg-cyan-500/10 text-cyan-400",
};

const ENGINE_STYLE: Record<string, string> = {
  PostgreSQL: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  MySQL:      "bg-amber-500/10 text-amber-300 border-amber-500/20",
  SQLite:     "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
};

const PERMISSION_STYLE: Record<string, string> = {
  "Full access": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Read only":   "bg-blue-500/10 text-blue-300 border-blue-500/20",
};

// ─── Component ────────────────────────────────────────────
const Content = () => {
  const [tab, setTab]       = useState<"files" | "people">("files");
  const [search, setSearch] = useState("");

  const filteredFiles = FILES.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.from.toLowerCase().includes(search.toLowerCase()) ||
    f.project.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPeople = PEOPLE.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase())
  );

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

        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#f0f4fa] tracking-[-1px] mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
              Shared with Me
            </h1>
            <p className="text-sm text-white/40 font-light">
              {FILES.length} database files shared by {PEOPLE.length} team members
            </p>
          </div>
          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 transition-all hover:-translate-y-0.5 text-white text-sm font-medium px-4 py-2.5 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
            Share a file
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "DB files shared",
              value: FILES.length.toString(),
              icon: "bg-blue-500/10 text-blue-400",
              iconSvg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>,
            },
            {
              label: "Team members",
              value: PEOPLE.length.toString(),
              icon: "bg-violet-500/10 text-violet-400",
              iconSvg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
            },
            {
              label: "Full access",
              value: FILES.filter((f) => f.permission === "Full access").length.toString(),
              icon: "bg-amber-500/10 text-amber-400",
              iconSvg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
            },
            {
              label: "AI analyzed",
              value: FILES.filter((f) => f.ai).length.toString(),
              icon: "bg-emerald-500/10 text-emerald-400",
              iconSvg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
            },
          ].map((s) => (
            <div key={s.label} className="group bg-white/3 border border-white/8 hover:border-blue-500/30 hover:bg-blue-500/4 rounded-xl p-4 transition-all cursor-default">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${s.icon}`}>{s.iconSvg}</div>
              <div className="text-2xl font-bold text-[#f0f4fa] mb-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
              <div className="text-[11px] text-white/35">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs + search */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center bg-white/3 border border-white/8 rounded-xl p-1 gap-1">
            {(["files", "people"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSearch(""); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === t
                    ? "bg-blue-500/15 text-blue-300 border border-blue-500/2"
                    : "text-white/35 hover:text-white/60"
                }`}
              >
                {t === "files" ? `DB Files (${FILES.length})` : `Team (${PEOPLE.length})`}
              </button>
            ))}
          </div>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              placeholder={tab === "files" ? "Search files or projects..." : "Search by name or role..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/3 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-xs text-[#e8edf5] placeholder-white/20 outline-none focus:border-blue-500/50 transition-colors w-56"
            />
          </div>
        </div>

        {/* ── FILES TAB ─────────────────────────────────── */}
        {tab === "files" && (
          <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2fr_100px_140px_120px_100px_100px_60px] gap-3 px-5 py-3 border-b border-white/[0.07]">
              {["Name", "Type", "Project", "Shared by", "Modified", "Access", ""].map((h) => (
                <span key={h} className="text-[10px] font-medium text-white/20 uppercase tracking-wider">{h}</span>
              ))}
            </div>
            {filteredFiles.map((file, i) => (
              <div
                key={i}
                className="grid grid-cols-[2fr_100px_140px_120px_100px_100px_60px] gap-3 items-center px-5 py-3 hover:bg-white/3 border-b border-white/4 last:border-0 transition-colors group"
              >
                {/* Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${FILE_ICON[file.type]}`}>
                    {file.type}
                  </div>
                  <span className="text-xs font-medium text-white/70 truncate group-hover:text-white/90 transition-colors">{file.name}</span>
                  {file.ai && <span className="text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-1.5 py-0.5 shrink-0">AI</span>}
                </div>
                {/* Engine */}
                <span>
                  {file.engine
                    ? <span className={`text-[9px] font-medium border rounded-full px-2 py-0.5 ${ENGINE_STYLE[file.engine]}`}>{file.engine}</span>
                    : <span className="text-[11px] text-white/20">—</span>
                  }
                </span>
                {/* Project */}
                <span className="text-[11px] text-white/35 truncate">{file.project}</span>
                {/* Shared by */}
                <span className="text-[11px] text-white/35 truncate">{file.from}</span>
                {/* Modified */}
                <span className="text-[11px] text-white/30">{file.modified}</span>
                {/* Permission */}
                <span className={`text-[9px] font-medium border rounded-full px-2 py-0.5 w-fit ${PERMISSION_STYLE[file.permission]}`}>
                  {file.permission}
                </span>
                {/* Actions */}
                <div className="hidden group-hover:flex items-center gap-1 justify-end">
                  <button className="w-6 h-6 flex items-center justify-center rounded-md bg-white/6 hover:bg-white/10 text-white/35 hover:text-white/65 transition-all" title="Download">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center rounded-md bg-white/6 hover:bg-white/10 text-white/35 hover:text-white/65 transition-all" title="Analyze with AI">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PEOPLE TAB ────────────────────────────────── */}
        {tab === "people" && (
          <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2fr_130px_100px_140px_120px_60px] gap-3 px-5 py-3 border-b border-white/[0.07]">
              {["Team member", "Role", "Files", "Last active", "Access level", ""].map((h) => (
                <span key={h} className="text-[10px] font-medium text-white/20 uppercase tracking-wider">{h}</span>
              ))}
            </div>
            {filteredPeople.map((person, i) => (
              <div
                key={i}
                className="grid grid-cols-[2fr_130px_100px_140px_120px_60px] gap-3 items-center px-5 py-3.5 hover:bg-white/3 border-b border-white/4 last:border-0 transition-colors group"
              >
                {/* Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full ${person.color} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                    {person.initials}
                  </div>
                  <span className="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {person.name}
                  </span>
                </div>
                {/* Role */}
                <span className="text-[11px] text-white/35">{person.role}</span>
                {/* Files */}
                <span className="text-[11px] text-white/30">{person.fileCount} files</span>
                {/* Last active */}
                <span className="text-[11px] text-white/30">{person.lastActive}</span>
                {/* Permission */}
                <span className={`text-[9px] font-medium border rounded-full px-2 py-0.5 w-fit ${PERMISSION_STYLE[person.permission]}`}>
                  {person.permission}
                </span>
                {/* Revoke */}
                <div className="hidden group-hover:flex items-center justify-end">
                  <button className="w-6 h-6 flex items-center justify-center rounded-md bg-red-500/8 hover:bg-red-500/15 text-red-400/50 hover:text-red-400 transition-all" title="Revoke access">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Content;