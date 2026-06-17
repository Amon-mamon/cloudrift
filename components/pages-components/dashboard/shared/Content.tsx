"use client";

import { useEffect, useMemo, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";

// ─── Types ────────────────────────────────────────────────
interface SharedFileData {
  id: string;
  name: string;
  type: string;
  engine?: string | null;
  aiAnalyzed: boolean;
  sizeBytes?: number | null;
  project?: { id: string; name: string } | null;
  updatedAt?: string | null;
}

interface SharedUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface ShareItem {
  id: string;
  permission: "FULL_ACCESS" | "READ_ONLY";
  createdAt: string;
  owner: SharedUser;
  sharedWithUser?: SharedUser | null;
  sharedWithEmail?: string;
  file: SharedFileData | null;
}

interface PersonFolder {
  email: string;
  name: string;
  initials: string;
  color: string;
  fileCount: number;
  lastShared: string;
  projects: ProjectGroup[];
}

interface ProjectGroup {
  projectId: string | null;
  projectName: string;
  files: ShareItem[];
}

// ─── Helpers ──────────────────────────────────────────────
const FILE_ICON: Record<string, string> = {
  SQL:    "bg-blue-500/10 text-blue-400",
  DB:     "bg-violet-500/10 text-violet-400",
  CSV:    "bg-emerald-500/10 text-emerald-400",
  JSON:   "bg-amber-500/10 text-amber-400",
  DUMP:   "bg-red-500/10 text-red-400",
  ENV:    "bg-zinc-500/10 text-zinc-400",
  SQLITE: "bg-cyan-500/10 text-cyan-400",
  OTHER:  "bg-white/10 text-white/50",
};

const ENGINE_STYLE: Record<string, string> = {
  PostgreSQL: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  MySQL:      "bg-amber-500/10 text-amber-300 border-amber-500/20",
  SQLite:     "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  UNKNOWN:    "bg-white/10 text-white/40 border-white/10",
};

const PERMISSION_STYLE: Record<string, string> = {
  FULL_ACCESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  READ_ONLY:   "bg-blue-500/10 text-blue-300 border-blue-500/20",
};

const PERSON_COLORS = [
  "bg-blue-600", "bg-amber-600", "bg-violet-600",
  "bg-red-600",  "bg-emerald-600", "bg-pink-600",
];

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });
};

const getInitials = (u: SharedUser) =>
  `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase();

const getFullName = (u?: SharedUser | null, fallback?: string) => {
  if (!u) return fallback ?? "Unknown";
  return `${u.firstName} ${u.lastName}`.trim() || fallback || "Unknown";
};

// Group shares by person, then by project inside each person
const groupByPersonThenProject = (
  shares: ShareItem[],
  getPersonKey: (s: ShareItem) => { user?: SharedUser | null; email?: string }
): PersonFolder[] => {
  const map = new Map<string, PersonFolder>();

  shares.filter((s) => s.file).forEach((share) => {
    const { user, email } = getPersonKey(share);
    const key   = email ?? user?.email ?? "unknown";
    const name  = getFullName(user, email);
    const pId   = share.file?.project?.id ?? "no-project";
    const pName = share.file?.project?.name ?? "No Project";

    if (!map.has(key)) {
      map.set(key, {
        email:     key,
        name,
        initials:  user ? getInitials(user) : (key[0] ?? "?").toUpperCase(),
        color:     PERSON_COLORS[map.size % PERSON_COLORS.length],
        fileCount: 0,
        lastShared: share.createdAt,
        projects:  [],
      });
    }

    const folder = map.get(key)!;
    folder.fileCount += 1;
    if (new Date(share.createdAt) > new Date(folder.lastShared)) {
      folder.lastShared = share.createdAt;
    }

    let pg = folder.projects.find((p) => p.projectId === pId);
    if (!pg) {
      pg = { projectId: pId, projectName: pName, files: [] };
      folder.projects.push(pg);
    }
    pg.files.push(share);
  });

  return Array.from(map.values());
};

type Tab = "shared-with-me" | "shared-by-me";

// ─── Component ────────────────────────────────────────────
const Content = () => {
  const [receivedShares, setReceived] = useState<ShareItem[]>([]);
  const [sentShares, setSent]         = useState<ShareItem[]>([]);
  const [tab, setTab]                 = useState<Tab>("shared-with-me");
  const [search, setSearch]           = useState("");
  const [openFolder, setOpenFolder]   = useState<PersonFolder | null>(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [r1, r2] = await Promise.all([
        authFetch("/api/shared"),
        authFetch("/api/shared?owner=true"),
      ]);
      if (!r1.ok || !r2.ok) throw new Error("Could not load shared files.");
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      setReceived(d1.shares ?? []);
      setSent(d2.shares ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Reset open folder when switching tabs
  const switchTab = (t: Tab) => {
    setTab(t);
    setOpenFolder(null);
    setSearch("");
  };

  // Received folders — grouped by the person who shared (owner)
  const receivedFolders = useMemo(() =>
    groupByPersonThenProject(receivedShares, (s) => ({
      user: s.owner, email: s.owner.email,
    })),
    [receivedShares]
  );

  // Sent folders — grouped by the person I shared with
  const sentFolders = useMemo(() =>
    groupByPersonThenProject(sentShares, (s) => ({
      user: s.sharedWithUser,
      email: s.sharedWithEmail ?? s.sharedWithUser?.email,
    })),
    [sentShares]
  );

  const activeFolders = tab === "shared-with-me" ? receivedFolders : sentFolders;

  const filteredFolders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeFolders;
    return activeFolders.filter((f) =>
      f.name.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      f.projects.some(
        (p) =>
          p.projectName.toLowerCase().includes(q) ||
          p.files.some((s) => s.file?.name.toLowerCase().includes(q))
      )
    );
  }, [activeFolders, search]);

  // Stats
  const stats = useMemo(() => ({
    received: receivedShares.filter((s) => s.file).length,
    sent:     sentShares.filter((s) => s.file).length,
    people:   new Set([
      ...receivedShares.map((s) => s.owner.email),
      ...sentShares.map((s) => s.sharedWithEmail ?? ""),
    ]).size,
  }), [receivedShares, sentShares]);

  // ── Folder open view ──────────────────────────────────
  if (openFolder) {
    return (
      <div className="min-h-screen bg-[#070b14] text-[#e8edf5] font-sans">
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <div className="absolute w-500 h-500 rounded-full opacity-20 blur-[90px] bg-blue-600" style={{ top: "-120px", left: "140px" }} />
          <div className="absolute w-90 h-90 rounded-full opacity-15 blur-[80px] bg-emerald-600" style={{ top: "60px", right: "-60px" }} />
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(56,138,221,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56,138,221,0.05) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        </div>

        <div className="relative z-10 p-8 max-w-6xl">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setOpenFolder(null)}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Shared Files
            </button>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-xs text-white/60">{tab === "shared-with-me" ? "Shared with me" : "Shared by me"}</span>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-xs text-[#f0f4fa] font-medium">{openFolder.name}</span>
          </div>

          {/* Person header card */}
          <div className="bg-white/3 border border-white/8 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full ${openFolder.color} flex items-center justify-center text-lg font-bold text-white shrink-0`}>
                {openFolder.initials}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#f0f4fa] tracking-tight mb-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {openFolder.name}
                </h2>
                <div className="text-xs text-white/35">{openFolder.email}</div>
                <div className="text-[11px] text-white/25 mt-1">
                  {openFolder.fileCount} files · {openFolder.projects.length} project{openFolder.projects.length !== 1 ? "s" : ""} · Last shared {formatDate(openFolder.lastShared)}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {tab === "shared-by-me" && (
                  <button className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 bg-red-500/6 hover:bg-red-500/12 border border-red-500/15 rounded-xl px-3 py-2 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    Revoke all access
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Project groups */}
          <div className="space-y-5">
            {openFolder.projects.map((pg) => (
              <div key={pg.projectId} className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">

                {/* Project header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
                  <div className="flex items-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
                      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
                    </svg>
                    <span className="text-sm font-semibold text-white/65" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {pg.projectName}
                    </span>
                    <span className="text-[10px] text-white/25 bg-white/4 border border-white/[0.07] rounded-full px-2 py-0.5">
                      {pg.files.length} file{pg.files.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* File table header */}
                <div className="grid grid-cols-[2fr_90px_100px_120px_110px_60px] gap-3 px-5 py-2.5 border-b border-white/5">
                  {["File", "Engine", "Modified", "Size", "Access", ""].map((h) => (
                    <span key={h} className="text-[10px] font-medium text-white/18 uppercase tracking-wider">{h}</span>
                  ))}
                </div>

                {/* Files */}
                {pg.files.map((share) => {
                  const file = share.file!;
                  return (
                    <div
                      key={share.id}
                      className="grid grid-cols-[2fr_90px_100px_120px_110px_60px] gap-3 items-center px-5 py-3 hover:bg-white/3 border-b border-white/4 last:border-0 transition-colors group"
                    >
                      {/* Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${FILE_ICON[file.type] ?? FILE_ICON.OTHER}`}>
                          {file.type}
                        </div>
                        <span className="text-xs font-medium text-white/70 truncate group-hover:text-white/90 transition-colors">
                          {file.name}
                        </span>
                        {file.aiAnalyzed && (
                          <span className="text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-1.5 py-0.5 shrink-0">AI</span>
                        )}
                      </div>

                      {/* Engine */}
                      <span>
                        {file.engine
                          ? <span className={`text-[9px] font-medium border rounded-full px-2 py-0.5 ${ENGINE_STYLE[file.engine] ?? ENGINE_STYLE.UNKNOWN}`}>{file.engine}</span>
                          : <span className="text-white/20 text-[11px]">—</span>
                        }
                      </span>

                      {/* Modified */}
                      <span className="text-[11px] text-white/30">{formatDate(file.updatedAt ?? share.createdAt)}</span>

                      {/* Size */}
                      <span className="text-[11px] text-white/30">
                        {file.sizeBytes
                          ? Number(file.sizeBytes) < 1024 * 1024
                            ? `${Math.round(Number(file.sizeBytes) / 1024)} KB`
                            : `${(Number(file.sizeBytes) / (1024 * 1024)).toFixed(1)} MB`
                          : "—"}
                      </span>

                      {/* Permission */}
                      <span className={`text-[9px] font-medium border rounded-full px-2 py-0.5 w-fit ${PERMISSION_STYLE[share.permission]}`}>
                        {share.permission === "FULL_ACCESS" ? "Full access" : "Read only"}
                      </span>

                      {/* Actions */}
                      <div className="hidden group-hover:flex items-center gap-1 justify-end">
                        <button className="w-6 h-6 flex items-center justify-center rounded-md bg-white/6 hover:bg-white/10 text-white/35 hover:text-white/65 transition-all" title="Download">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        </button>
                        {tab === "shared-by-me" && (
                          <button className="w-6 h-6 flex items-center justify-center rounded-md bg-red-500/8 hover:bg-red-500/15 text-red-400/50 hover:text-red-400 transition-all" title="Revoke">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Folder grid view ──────────────────────────────────
  return (
    <div className="min-h-screen bg-[#070b14] text-[#e8edf5] font-sans">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute w-500 h-500 rounded-full opacity-20 blur-[90px] bg-blue-600" style={{ top: "-120px", left: "140px" }} />
        <div className="absolute w-90 h-90 rounded-full opacity-15 blur-[80px] bg-emerald-600" style={{ top: "60px", right: "-60px" }} />
        <div className="absolute w-60 h-60 rounded-full opacity-10 blur-[70px] bg-violet-700" style={{ bottom: "60px", left: "45%" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(56,138,221,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56,138,221,0.05) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      <div className="relative z-10 p-8 w-full">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#f0f4fa] tracking-[-1px] mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
              Shared Files
            </h1>
            <p className="text-sm text-white/40 font-light">
              {stats.received} received · {stats.sent} sent · {stats.people} people
            </p>
          </div>
          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 transition-all hover:-translate-y-0.5 text-white text-sm font-medium px-4 py-2.5 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
            Share a file
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Shared with me",  value: stats.received, icon: "bg-blue-500/10 text-blue-400",    svg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> },
            { label: "Shared by me",    value: stats.sent,     icon: "bg-violet-500/10 text-violet-400", svg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg> },
            { label: "People involved", value: stats.people,   icon: "bg-emerald-500/10 text-emerald-400", svg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          ].map((s) => (
            <div key={s.label} className="group bg-white/3 border border-white/8 hover:border-blue-500/30 hover:bg-blue-500/4 rounded-xl p-4 transition-all cursor-default">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${s.icon}`}>{s.svg}</div>
              <div className="text-2xl font-bold text-[#f0f4fa] mb-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
              <div className="text-[11px] text-white/35">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs + search */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center bg-white/3 border border-white/8 rounded-xl p-1 gap-1">
            {([
              { id: "shared-with-me" as Tab, label: `Shared with me (${receivedFolders.length})` },
              { id: "shared-by-me"   as Tab, label: `Shared by me (${sentFolders.length})`        },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  tab === t.id
                    ? "bg-blue-500/15 text-blue-300 border border-blue-500/2"
                    : "text-white/35 hover:text-white/60"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              placeholder="Search people, projects or files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/3 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-xs text-[#e8edf5] placeholder-white/20 outline-none focus:border-blue-500/50 transition-colors w-64"
            />
          </div>
        </div>

        {/* Folder grid */}
        {isLoading ? (
          <div className="p-16 text-center text-sm text-white/30">Loading shared files…</div>
        ) : filteredFolders.length === 0 ? (
          <div className="p-16 text-center bg-white/3 border border-white/8 rounded-xl">
            <div className="text-sm text-white/30 mb-1">
              {tab === "shared-with-me" ? "No one has shared files with you yet." : "You haven't shared any files yet."}
            </div>
            <div className="text-xs text-white/18">
              {tab === "shared-with-me" ? "When someone shares a file with you it will appear here." : "Share a file from My Drive to get started."}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFolders.map((folder) => (
              <button
                key={folder.email}
                onClick={() => setOpenFolder(folder)}
                className="group bg-white/3 border border-white/8 hover:border-blue-500/30 hover:bg-blue-500/4 rounded-xl p-4 text-left transition-all hover:-translate-y-0.5"
              >
                {/* Top row — avatar + arrow */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-full ${folder.color} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                    {folder.initials}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-blue-400 transition-colors">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>

                {/* Name + email */}
                <div className="text-sm font-semibold text-white/80 group-hover:text-white/95 transition-colors truncate mb-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {folder.name}
                </div>
                <div className="text-[11px] text-white/30 truncate mb-3">{folder.email}</div>

                {/* Project pills */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {folder.projects.slice(0, 3).map((p) => (
                    <span key={p.projectId} className="text-[9px] text-white/35 bg-white/4 border border-white/[0.07] rounded-full px-2 py-0.5 truncate max-w-25">
                      {p.projectName}
                    </span>
                  ))}
                  {folder.projects.length > 3 && (
                    <span className="text-[9px] text-white/25 bg-white/4 border border-white/[0.07] rounded-full px-2 py-0.5">
                      +{folder.projects.length - 3} more
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-white/6 flex items-center justify-between">
                  <span className="text-[11px] text-white/30">
                    {folder.fileCount} file{folder.fileCount !== 1 ? "s" : ""} · {folder.projects.length} project{folder.projects.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-[10px] text-white/20">{formatDate(folder.lastShared)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;