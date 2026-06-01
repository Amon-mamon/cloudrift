"use client";

import { JSX, useState } from "react";

// ─── Types ────────────────────────────────────────────────
type ActionType = "upload" | "download" | "share" | "delete" | "ai" | "access";

interface LogEntry {
  id: number;
  user: { initials: string; name: string; color: string; };
  action: ActionType;
  description: string;
  file: string;
  fileType: string;
  project: string;
  time: string;
  ip: string;
}

// ─── Mock Data ────────────────────────────────────────────
const LOGS: LogEntry[] = [
  { id: 1,  user: { initials: "JD", name: "You",            color: "bg-blue-600"    }, action: "upload",   description: "Uploaded file",           file: "schema_v4.sql",          fileType: "SQL",    project: "E-Commerce Platform",  time: "2 min ago",    ip: "192.168.1.1"   },
  { id: 2,  user: { initials: "MA", name: "Maria Andres",   color: "bg-blue-600"    }, action: "ai",       description: "Ran AI DB Analyzer on",   file: "ecommerce_schema_v4.sql", fileType: "SQL",    project: "E-Commerce Platform",  time: "15 min ago",   ip: "192.168.1.24"  },
  { id: 3,  user: { initials: "KL", name: "Krista Lim",     color: "bg-violet-600"  }, action: "download", description: "Downloaded file",          file: "users_schema.sql",        fileType: "SQL",    project: "Auth Service",         time: "1 hour ago",   ip: "10.0.0.12"     },
  { id: 4,  user: { initials: "JD", name: "You",            color: "bg-blue-600"    }, action: "share",    description: "Shared file with team",   file: "products_export.csv",     fileType: "CSV",    project: "E-Commerce Platform",  time: "2 hours ago",  ip: "192.168.1.1"   },
  { id: 5,  user: { initials: "RB", name: "Ramon Bautista", color: "bg-amber-600"   }, action: "access",   description: "Accessed file",           file: "auth_backup.dump",        fileType: "DUMP",   project: "Auth Service",         time: "3 hours ago",  ip: "172.16.0.5"    },
  { id: 6,  user: { initials: "JD", name: "You",            color: "bg-blue-600"    }, action: "ai",       description: "Ran Query Assistant on",  file: "users_schema.sql",        fileType: "SQL",    project: "Auth Service",         time: "5 hours ago",  ip: "192.168.1.1"   },
  { id: 7,  user: { initials: "TN", name: "Troy Navarro",   color: "bg-red-600"     }, action: "download", description: "Downloaded file",          file: "app_local.sqlite",        fileType: "SQLITE", project: "Mobile App Backend",   time: "6 hours ago",  ip: "10.0.0.44"     },
  { id: 8,  user: { initials: "JD", name: "You",            color: "bg-blue-600"    }, action: "upload",   description: "Uploaded file",           file: "seed_data.sql",           fileType: "SQL",    project: "E-Commerce Platform",  time: "Yesterday",    ip: "192.168.1.1"   },
  { id: 9,  user: { initials: "SA", name: "Sofia Aquino",   color: "bg-emerald-600" }, action: "ai",       description: "Ran Schema Diff on",      file: "inventory_schema.sql",    fileType: "SQL",    project: "Inventory System",     time: "Yesterday",    ip: "10.0.0.88"     },
  { id: 10, user: { initials: "KL", name: "Krista Lim",     color: "bg-violet-600"  }, action: "delete",   description: "Deleted file",            file: "old_migration.sql",       fileType: "SQL",    project: "Auth Service",         time: "2 days ago",   ip: "10.0.0.12"     },
  { id: 11, user: { initials: "JD", name: "You",            color: "bg-blue-600"    }, action: "share",    description: "Shared file with team",   file: "analytics_config.json",   fileType: "JSON",   project: "Analytics Dashboard",  time: "2 days ago",   ip: "192.168.1.1"   },
  { id: 12, user: { initials: "MA", name: "Maria Andres",   color: "bg-blue-600"    }, action: "upload",   description: "Uploaded file",           file: "db_backup_oct.dump",      fileType: "DUMP",   project: "E-Commerce Platform",  time: "3 days ago",   ip: "192.168.1.24"  },
];

// ─── Helpers ──────────────────────────────────────────────
const ACTION_STYLE: Record<ActionType, { label: string; color: string; icon: JSX.Element }> = {
  upload:   { label: "Upload",   color: "bg-blue-500/10 text-blue-400 border-blue-500/20",     icon: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg> },
  download: { label: "Download", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> },
  share:    { label: "Share",    color: "bg-violet-500/10 text-violet-400 border-violet-500/20",   icon: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg> },
  delete:   { label: "Delete",   color: "bg-red-500/10 text-red-400 border-red-500/20",           icon: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg> },
  ai:       { label: "AI Tool",  color: "bg-amber-500/10 text-amber-400 border-amber-500/20",     icon: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg> },
  access:   { label: "Access",   color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",        icon: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> },
};

const FILE_ICON: Record<string, string> = {
  SQL:    "bg-blue-500/10 text-blue-400",
  CSV:    "bg-emerald-500/10 text-emerald-400",
  JSON:   "bg-amber-500/10 text-amber-400",
  DUMP:   "bg-red-500/10 text-red-400",
  SQLITE: "bg-cyan-500/10 text-cyan-400",
};

const ALL_ACTIONS: ActionType[] = ["upload", "download", "share", "delete", "ai", "access"];

// ─── Component ────────────────────────────────────────────
const Content = () => {
  const [filterAction, setFilterAction] = useState<ActionType | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = LOGS.filter((log) => {
    const matchAction = filterAction === "all" || log.action === filterAction;
    const matchSearch =
      log.file.toLowerCase().includes(search.toLowerCase()) ||
      log.user.name.toLowerCase().includes(search.toLowerCase()) ||
      log.project.toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSearch;
  });

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
              Activity Log
            </h1>
            <p className="text-sm text-white/40 font-light">
              Track every action across all your database files and projects
            </p>
          </div>
          <button className="flex items-center gap-1.5 bg-white/3 hover:bg-white/6 border border-white/10 hover:border-white/18 text-white/50 hover:text-white/75 text-sm font-medium px-4 py-2.5 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export log
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {ALL_ACTIONS.map((action) => {
            const count = LOGS.filter((l) => l.action === action).length;
            const style = ACTION_STYLE[action];
            return (
              <button
                key={action}
                onClick={() => setFilterAction(filterAction === action ? "all" : action)}
                className={`group bg-white/3 border rounded-xl p-3 text-left transition-all hover:-translate-y-0.5 ${
                  filterAction === action
                    ? "border-blue-500/30 bg-blue-500/6"
                    : "border-white/8 hover:border-white/[0.14]"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 border ${style.color}`}>
                  {style.icon}
                </div>
                <div className="text-lg font-bold text-[#f0f4fa]" style={{ fontFamily: "'Syne', sans-serif" }}>{count}</div>
                <div className="text-[10px] text-white/30 capitalize">{style.label}</div>
              </button>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterAction("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filterAction === "all"
                  ? "bg-blue-500/15 text-blue-300 border-blue-500/2"
                  : "text-white/35 hover:text-white/60 border-transparent hover:bg-white/4"
              }`}
            >
              All activity
            </button>
            {ALL_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => setFilterAction(filterAction === action ? "all" : action)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border capitalize ${
                  filterAction === action
                    ? "bg-blue-500/15 text-blue-300 border-blue-500/2"
                    : "text-white/35 hover:text-white/60 border-transparent hover:bg-white/4"
                }`}
              >
                {ACTION_STYLE[action].label}
              </button>
            ))}
          </div>
          <div className="relative shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/3 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-xs text-[#e8edf5] placeholder-white/20 outline-none focus:border-blue-500/50 transition-colors w-48"
            />
          </div>
        </div>

        {/* Log table */}
        <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[180px_2fr_140px_120px_100px_100px] gap-3 px-5 py-3 border-b border-white/[0.07]">
            {["User", "File & Project", "Action", "Time", "IP Address", ""].map((h) => (
              <span key={h} className="text-[10px] font-medium text-white/20 uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/15"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <p className="text-sm text-white/25">No activity found</p>
            </div>
          ) : (
            filtered.map((log) => {
              const style = ACTION_STYLE[log.action];
              return (
                <div key={log.id} className="grid grid-cols-[180px_2fr_140px_120px_100px_100px] gap-3 items-center px-5 py-3 hover:bg-white/3 border-b border-white/4 last:border-0 transition-colors group">
                  {/* User */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-full ${log.user.color} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                      {log.user.initials}
                    </div>
                    <span className="text-xs text-white/60 truncate">{log.user.name}</span>
                  </div>

                  {/* File */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0 ${FILE_ICON[log.fileType] ?? "bg-white/10 text-white/40"}`}>
                      {log.fileType}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white/70 truncate group-hover:text-white/90 transition-colors">{log.file}</div>
                      <div className="text-[10px] text-white/28 truncate">{log.project}</div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-medium border rounded-full px-2 py-1 w-fit ${style.color}`}>
                    {style.icon}
                    {style.label}
                  </div>

                  {/* Time */}
                  <span className="text-[11px] text-white/30">{log.time}</span>

                  {/* IP */}
                  <span className="text-[10px] text-white/22 font-mono">{log.ip}</span>

                  {/* Empty action col */}
                  <div />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
export default Content;