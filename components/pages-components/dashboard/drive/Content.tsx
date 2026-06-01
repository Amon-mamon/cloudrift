"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────
interface Member {
  initials: string;
  color: string;
}

interface FileItem {
  name: string;
  type: "SQL" | "DB" | "CSV" | "JSON" | "DUMP" | "ENV" | "SQLITE";
  size: string;
  modified: string;
  engine?: string;
  ai?: boolean;
}

interface Folder {
  id: number;
  name: string;
  fileCount: number;
  modified: string;
  members: Member[];
  color: string;
  engine: string;
  files: FileItem[];
}

// ─── Mock Data ────────────────────────────────────────────
const FOLDERS: Folder[] = [
  {
    id: 1,
    name: "E-Commerce Platform",
    fileCount: 12,
    modified: "2 hours ago",
    color: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    engine: "PostgreSQL",
    members: [
      { initials: "JD", color: "bg-blue-600" },
      { initials: "MA", color: "bg-emerald-600" },
      { initials: "KL", color: "bg-violet-600" },
    ],
    files: [
      { name: "schema_v4.sql",          type: "SQL",    size: "84 KB",  modified: "2h ago",  engine: "PostgreSQL", ai: true  },
      { name: "seed_data.sql",          type: "SQL",    size: "2.1 MB", modified: "2h ago",  engine: "PostgreSQL", ai: false },
      { name: "products_export.csv",    type: "CSV",    size: "5.4 MB", modified: "1d ago",  ai: false },
      { name: "db_backup_oct.dump",     type: "DUMP",   size: "18 MB",  modified: "2d ago",  engine: "PostgreSQL", ai: false },
      { name: "config.env",             type: "ENV",    size: "1.2 KB", modified: "3d ago",  ai: false },
    ],
  },
  {
    id: 2,
    name: "Auth Service",
    fileCount: 7,
    modified: "Yesterday",
    color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    engine: "MySQL",
    members: [
      { initials: "JD", color: "bg-blue-600" },
      { initials: "RB", color: "bg-amber-600" },
    ],
    files: [
      { name: "users_schema.sql",       type: "SQL",    size: "32 KB",  modified: "1d ago",  engine: "MySQL",      ai: true  },
      { name: "roles_permissions.sql",  type: "SQL",    size: "18 KB",  modified: "1d ago",  engine: "MySQL",      ai: true  },
      { name: "sessions.json",          type: "JSON",   size: "240 KB", modified: "2d ago",  ai: false },
      { name: "auth_backup.dump",       type: "DUMP",   size: "8.6 MB", modified: "1w ago",  engine: "MySQL",      ai: false },
    ],
  },
  {
    id: 3,
    name: "Analytics Dashboard",
    fileCount: 18,
    modified: "3 days ago",
    color: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    engine: "PostgreSQL",
    members: [
      { initials: "KL", color: "bg-violet-600" },
      { initials: "MA", color: "bg-emerald-600" },
      { initials: "JD", color: "bg-blue-600" },
      { initials: "TN", color: "bg-red-600" },
    ],
    files: [
      { name: "events_schema.sql",      type: "SQL",    size: "56 KB",  modified: "3d ago",  engine: "PostgreSQL", ai: true  },
      { name: "metrics_raw.csv",        type: "CSV",    size: "14 MB",  modified: "3d ago",  ai: false },
      { name: "aggregates.json",        type: "JSON",   size: "3.2 MB", modified: "4d ago",  ai: false },
      { name: "analytics_full.dump",    type: "DUMP",   size: "42 MB",  modified: "1w ago",  engine: "PostgreSQL", ai: false },
    ],
  },
  {
    id: 4,
    name: "Mobile App Backend",
    fileCount: 9,
    modified: "1 week ago",
    color: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    engine: "SQLite",
    members: [
      { initials: "JD", color: "bg-blue-600" },
      { initials: "RB", color: "bg-amber-600" },
    ],
    files: [
      { name: "app_local.sqlite",       type: "SQLITE", size: "4.8 MB", modified: "1w ago",  engine: "SQLite",     ai: true  },
      { name: "migrations_v3.sql",      type: "SQL",    size: "22 KB",  modified: "1w ago",  engine: "SQLite",     ai: false },
      { name: "notifications.json",     type: "JSON",   size: "980 KB", modified: "2w ago",  ai: false },
    ],
  },
  {
    id: 5,
    name: "Inventory System",
    fileCount: 14,
    modified: "2 weeks ago",
    color: "bg-red-500/10 border-red-500/20 text-red-400",
    engine: "MySQL",
    members: [
      { initials: "JD", color: "bg-blue-600" },
      { initials: "MA", color: "bg-emerald-600" },
      { initials: "KL", color: "bg-violet-600" },
      { initials: "TN", color: "bg-red-600" },
    ],
    files: [
      { name: "inventory_schema.sql",   type: "SQL",    size: "48 KB",  modified: "2w ago",  engine: "MySQL",      ai: true  },
      { name: "stock_export.csv",       type: "CSV",    size: "8.7 MB", modified: "2w ago",  ai: false },
      { name: "warehouse_db.dump",      type: "DUMP",   size: "24 MB",  modified: "3w ago",  engine: "MySQL",      ai: false },
      { name: "db.env",                 type: "ENV",    size: "890 B",  modified: "1mo ago", ai: false },
    ],
  },
  {
    id: 6,
    name: "CRM System",
    fileCount: 11,
    modified: "1 month ago",
    color: "bg-pink-500/10 border-pink-500/20 text-pink-400",
    engine: "PostgreSQL",
    members: [
      { initials: "MA", color: "bg-emerald-600" },
      { initials: "RB", color: "bg-amber-600" },
    ],
    files: [
      { name: "crm_schema_v2.sql",      type: "SQL",    size: "72 KB",  modified: "1mo ago", engine: "PostgreSQL", ai: true  },
      { name: "contacts_seed.csv",      type: "CSV",    size: "6.1 MB", modified: "1mo ago", ai: false },
      { name: "crm_backup.dump",        type: "DUMP",   size: "31 MB",  modified: "1mo ago", engine: "PostgreSQL", ai: false },
    ],
  },
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

const FolderIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
  </svg>
);

// ─── Component ────────────────────────────────────────────
const Content = () => {
  const [openFolder, setOpenFolder] = useState<Folder | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = FOLDERS.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.engine.toLowerCase().includes(search.toLowerCase())
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
              My Drive
            </h1>
            <p className="text-sm text-white/40 font-light">
              {FOLDERS.length} projects · {FOLDERS.reduce((a, f) => a + f.fileCount, 0)} database files total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 bg-transparent border border-white/12 hover:border-white/22 text-white/50 hover:text-white/75 text-sm font-medium px-4 py-2.5 rounded-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              New project
            </button>
            <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 transition-all hover:-translate-y-0.5 text-white text-sm font-medium px-4 py-2.5 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
              Upload file
            </button>
          </div>
        </div>

        {/* Search + view toggle */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              placeholder="Search projects or DB engine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/3 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#e8edf5] placeholder-white/20 outline-none focus:border-blue-500/50 focus:bg-white/5 transition-colors"
            />
          </div>
          <div className="flex items-center bg-white/3 border border-white/8 rounded-xl p-1 gap-1">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                  view === v
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/2"
                    : "text-white/25 hover:text-white/50"
                }`}
              >
                {v === "grid" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── FOLDER OPEN VIEW ───────────────────────────── */}
        {openFolder ? (
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-5">
              <button onClick={() => setOpenFolder(null)} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                My Drive
              </button>
              <span className="text-white/20 text-xs">/</span>
              <span className="text-xs text-[#f0f4fa] font-medium">{openFolder.name}</span>
            </div>

            {/* Folder header */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-5 mb-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${openFolder.color}`}>
                    <FolderIcon />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-[#f0f4fa] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {openFolder.name}
                      </h2>
                      <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${ENGINE_STYLE[openFolder.engine]}`}>
                        {openFolder.engine}
                      </span>
                    </div>
                    <p className="text-xs text-white/35">{openFolder.fileCount} files · Modified {openFolder.modified}</p>
                  </div>
                </div>

                {/* Members */}
                <div>
                  <p className="text-[10px] text-white/25 mb-1.5 text-right">Team members</p>
                  <div className="flex items-center">
                    {openFolder.members.map((m, i) => (
                      <div key={i} title={m.initials} className={`w-7 h-7 rounded-full ${m.color} border-2 border-[#070b14] flex items-center justify-center text-[10px] font-bold text-white shrink-0 -ml-1.5 first:ml-0`}>
                        {m.initials}
                      </div>
                    ))}
                    <button className="w-7 h-7 rounded-full bg-white/6 border-2 border-[#070b14] border-dashed flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-all -ml-1.5 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Files table */}
            <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
                <h3 className="text-xs font-semibold text-white/50" style={{ fontFamily: "'Syne', sans-serif" }}>Files</h3>
                <button className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 bg-blue-500/8 hover:bg-blue-500/[0.14] border border-blue-500/2 rounded-lg px-2.5 py-1 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
                  Upload here
                </button>
              </div>
              <div className="grid grid-cols-[2fr_70px_100px_120px_100px_80px] gap-3 px-5 py-2.5 border-b border-white/5">
                {["Name", "Type", "Engine", "Modified", "Size", ""].map((h) => (
                  <span key={h} className="text-[10px] font-medium text-white/20 uppercase tracking-wider">{h}</span>
                ))}
              </div>
              {openFolder.files.map((file, i) => (
                <div key={i} className="grid grid-cols-[2fr_70px_100px_120px_100px_80px] gap-3 items-center px-5 py-3 hover:bg-white/3 border-b border-white/4 last:border-0 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${FILE_ICON[file.type]}`}>
                      {file.type}
                    </div>
                    <span className="text-xs font-medium text-white/70 truncate group-hover:text-white/90 transition-colors">{file.name}</span>
                    {file.ai && <span className="text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-1.5 py-0.5 shrink-0">AI</span>}
                  </div>
                  <span className="text-[11px] text-white/30">{file.type}</span>
                  <span className="text-[11px]">
                    {file.engine ? (
                      <span className={`text-[9px] font-medium border rounded-full px-1.5 py-0.5 ${ENGINE_STYLE[file.engine]}`}>{file.engine}</span>
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </span>
                  <span className="text-[11px] text-white/30">{file.modified}</span>
                  <span className="text-[11px] text-white/30">{file.size}</span>
                  <div className="hidden group-hover:flex items-center gap-1.5 justify-end">
                    <button className="w-6 h-6 flex items-center justify-center rounded-md bg-white/6 hover:bg-white/10 text-white/35 hover:text-white/65 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    </button>
                    <button className="w-6 h-6 flex items-center justify-center rounded-md bg-white/6 hover:bg-white/10 text-white/35 hover:text-white/65 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                    </button>
                    <button className="w-6 h-6 flex items-center justify-center rounded-md bg-red-500/8 hover:bg-red-500/15 text-red-400/50 hover:text-red-400 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        ) : (
          <>
            {view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setOpenFolder(folder)}
                    className="group bg-white/3 border border-white/8 hover:border-blue-500/30 hover:bg-blue-500/4 rounded-xl p-4 text-left transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${folder.color}`}>
                        <FolderIcon />
                      </div>
                      <div className="flex items-center">
                        {folder.members.slice(0, 3).map((m, i) => (
                          <div key={i} title={m.initials} className={`w-6 h-6 rounded-full ${m.color} border-2 border-[#0f1623] flex items-center justify-center text-[9px] font-bold text-white shrink-0 -ml-1.5 first:ml-0`}>
                            {m.initials}
                          </div>
                        ))}
                        {folder.members.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-white/8 border-2 border-[#0f1623] flex items-center justify-center text-[9px] text-white/40 -ml-1.5">
                            +{folder.members.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-white/80 group-hover:text-white/95 transition-colors mb-1 truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {folder.name}
                    </div>
                    <div className="text-[11px] text-white/30 mb-2">
                      {folder.fileCount} files · {folder.modified}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/6 flex items-center justify-between">
                      <div className="flex gap-1">
                        {/* DB engine badge */}
                        <span className={`text-[9px] font-medium border rounded-full px-2 py-0.5 ${ENGINE_STYLE[folder.engine]}`}>
                          {folder.engine}
                        </span>
                        {/* File type pills */}
                        {["SQL", "CSV"].map((t) => (
                          <span key={t} className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${FILE_ICON[t]} bg-white/4`}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-blue-400 transition-colors">
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </div>
                  </button>
                ))}

                {/* New project card */}
                <button className="group bg-white/2 border border-dashed border-white/10 hover:border-blue-500/35 hover:bg-blue-500/4 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all min-h-35">
                  <div className="w-10 h-10 rounded-xl bg-white/4 group-hover:bg-blue-500/10 border border-white/8 group-hover:border-blue-500/25 flex items-center justify-center transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/25 group-hover:text-blue-400 transition-colors"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </div>
                  <span className="text-xs text-white/25 group-hover:text-white/45 transition-colors">New project</span>
                </button>
              </div>

            ) : (
              <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[2fr_120px_100px_120px_1fr_60px] gap-4 px-5 py-3 border-b border-white/[0.07]">
                  {["Project", "Engine", "Files", "Modified", "Members", ""].map((h) => (
                    <span key={h} className="text-[10px] font-medium text-white/20 uppercase tracking-wider">{h}</span>
                  ))}
                </div>
                {filtered.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setOpenFolder(folder)}
                    className="w-full grid grid-cols-[2fr_120px_100px_120px_1fr_60px] gap-4 items-center px-5 py-3.5 hover:bg-white/3 border-b border-white/5 last:border-0 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${folder.color}`}>
                        <FolderIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-white/70 group-hover:text-white/90 truncate transition-colors" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {folder.name}
                      </span>
                    </div>
                    <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 w-fit ${ENGINE_STYLE[folder.engine]}`}>{folder.engine}</span>
                    <span className="text-xs text-white/30">{folder.fileCount} files</span>
                    <span className="text-xs text-white/30">{folder.modified}</span>
                    <div className="flex items-center">
                      {folder.members.slice(0, 4).map((m, i) => (
                        <div key={i} title={m.initials} className={`w-6 h-6 rounded-full ${m.color} border-2 border-[#0a0f1c] flex items-center justify-center text-[9px] font-bold text-white shrink-0 -ml-1.5 first:ml-0`}>
                          {m.initials}
                        </div>
                      ))}
                      {folder.members.length > 4 && (
                        <div className="w-6 h-6 rounded-full bg-white/8 border-2 border-[#0a0f1c] flex items-center justify-center text-[9px] text-white/40 -ml-1.5">
                          +{folder.members.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-blue-400 transition-colors">
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Content;