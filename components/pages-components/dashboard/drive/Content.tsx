"use client";

import { useEffect, useMemo, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { toast } from "sonner";

interface ApiFile {
  id: string;
  name: string;
  type: string;
  sizeBytes?: number | string | null;
  engine?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  projectId?: string | null;
}

interface ApiProject {
  id: string;
  name: string;
  engine?: string | null;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
  files: ApiFile[];
}

interface ShareRecipient {
  id: string;
  email: string;
  name: string;
  permission: "FULL_ACCESS" | "READ_ONLY";
  projectId?: string | null;
}

interface OwnerShare {
  id: string;
  sharedWithEmail: string;
  sharedWithUser?: { firstName: string; lastName: string } | null;
  permission: "FULL_ACCESS" | "READ_ONLY";
  file?: {
    project?: { id: string; name: string } | null;
  } | null;
}

const FILE_ICON: Record<string, string> = {
  SQL: "bg-blue-500/10 text-blue-400",
  DB: "bg-violet-500/10 text-violet-400",
  CSV: "bg-emerald-500/10 text-emerald-400",
  JSON: "bg-amber-500/10 text-amber-400",
  DUMP: "bg-red-500/10 text-red-400",
  ENV: "bg-zinc-500/10 text-zinc-400",
  SQLITE: "bg-cyan-500/10 text-cyan-400",
  OTHER: "bg-white/10 text-white/50",
};

const ENGINE_STYLE: Record<string, string> = {
  PostgreSQL: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  MySQL: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  SQLite: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  UNKNOWN: "bg-white/10 text-white/40 border-white/10",
};

const PROJECT_COLOR_CLASS: Record<string, string> = {
  PostgreSQL:
    "bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-violet-500/10 border-blue-500/20 text-blue-300",
  MySQL:
    "bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-yellow-500/10 border-amber-500/20 text-amber-300",
  SQLite:
    "bg-gradient-to-br from-cyan-500/10 via-sky-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-300",
};

const getProjectColorClass = (engine?: string | null) => {
  if (!engine) return PROJECT_COLOR_CLASS.SQLite;
  return PROJECT_COLOR_CLASS[engine] ?? PROJECT_COLOR_CLASS.SQLite;
};

const FolderIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </svg>
);

// ── Shared trash icon so both project + file delete look identical ──
const TrashIcon = () => (
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
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const ShareIcon = () => (
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
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
  </svg>
);

const formatDate = (value?: string | null) => {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getFileSizeLabel = (size?: number | string | null) => {
  const parsed = typeof size === "string" ? Number(size) : size;
  if (!parsed || parsed <= 0) return "--";
  if (parsed < 1024) return `${parsed} B`;
  if (parsed < 1024 * 1024) return `${Math.round(parsed / 1024)} KB`;
  return `${Math.round(parsed / (1024 * 1024))} MB`;
};

const Content = () => {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [openProject, setOpenProject] = useState<ApiProject | null>(null);
  const [shareRecipients, setShareRecipients] = useState<ShareRecipient[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsuploading] = useState(false);

  const totalFiles = useMemo(
    () => projects.reduce((acc, project) => acc + project.files.length, 0),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return projects;
    return projects.filter((project) => {
      const matchesProject =
        project.name.toLowerCase().includes(normalized) ||
        (project.engine ?? "").toLowerCase().includes(normalized);
      const matchesFile = project.files.some(
        (file) =>
          file.name.toLowerCase().includes(normalized) ||
          (file.engine ?? "").toLowerCase().includes(normalized) ||
          file.type.toLowerCase().includes(normalized),
      );
      return matchesProject || matchesFile;
    });
  }, [projects, search]);

  const loadDriveData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch("/api/drive");
      if (!response.ok) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.error || "Could not load drive data.");
      }
      const data = await response.json();
      setProjects(data.projects ?? []);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to load drive data.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadShareRecipients = async (projectId?: string) => {
    if (!projectId) {
      setShareRecipients([]);
      return;
    }
    try {
      const response = await authFetch("/api/shared?owner=true");
      if (!response.ok) {
        setShareRecipients([]);
        return;
      }
      const data = await response.json();
      const shares: OwnerShare[] = data.shares ?? [];
      const recipients = shares
        .filter((share) => share.file?.project?.id === projectId)
        .map((share) => ({
          id: share.id,
          email: share.sharedWithEmail,
          name:
            share.sharedWithUser?.firstName || share.sharedWithUser?.lastName
              ? `${share.sharedWithUser?.firstName ?? ""} ${share.sharedWithUser?.lastName ?? ""}`.trim()
              : share.sharedWithEmail,
          permission: share.permission,
          projectId: share.file?.project?.id,
        }));
      setShareRecipients(
        Array.from(new Map(recipients.map((r) => [r.email, r])).values()),
      );
    } catch {
      setShareRecipients([]);
    }
  };

  useEffect(() => {
    loadDriveData();
  }, []);

  // ── Existing handlers (unchanged) ─────────────────────
  const handleCreateProject = async () => {
    const name = window.prompt("Enter a project name:");
    if (!name?.trim()) return;
    const engine =
      window
        .prompt("Database engine (PostgreSQL, MySQL, SQLite):", "PostgreSQL")
        ?.trim() || "PostgreSQL";
    try {
      const response = await authFetch("/api/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), engine, color: undefined }),
      });
      if (!response.ok) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.error || "Could not create project.");
      }
      const json = await response.json();
      setProjects((current) => [...current, { ...json.project, files: [] }]);
    } catch (caught) {
      window.alert(
        caught instanceof Error ? caught.message : "Failed to create project.",
      );
    }
  };

  // ── NEW: Delete project ────────────────────────────────
  const handleDeleteProject = async (
    project: ApiProject,
    e: React.MouseEvent,
  ) => {
    // Stop propagation so clicking delete doesn't also open the folder
    e.stopPropagation();
    if (
      !window.confirm(
        `Delete project "${project.name}" and all its files? This cannot be undone.`,
      )
    )
      return;
    try {
      const response = await authFetch(`/api/drive/${project.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.error || "Could not delete project.");
      }
      window.alert("Folder Deleted Successfully");
      setProjects((current) => current.filter((p) => p.id !== project.id));
      // If user was inside this project, go back to drive root
      if (openProject?.id === project.id) setOpenProject(null);
    } catch (caught) {
      window.alert(
        caught instanceof Error ? caught.message : "Failed to delete project.",
      );
    }
  };

  const handleUploadFile = async () => {
    if (!openProject) {
      window.alert("Open a project first to upload a file into it.");
      return;
    }

    const name = window.prompt("File name:", "new-database.sql");
    if (!name?.trim()) return;
    setIsuploading(true);

    const type = window
      .prompt(
        "File type: SQL, DB, CSV, JSON, DUMP, ENV, SQLITE or OTHER",
        "SQL",
      )
      ?.trim()
      .toUpperCase();

    const validTypes = [
      "SQL",
      "DB",
      "CSV",
      "JSON",
      "DUMP",
      "ENV",
      "SQLITE",
      "OTHER",
    ];

    const fileType = validTypes.includes(type || "") ? type : "OTHER";

    try {
      const response = await authFetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          type: fileType,
          projectId: openProject.id,
          engine: openProject.engine || undefined,
          sizeBytes: 0,
        }),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => null);

        throw new Error(json?.error || "Could not upload file.");
      }

      const json = await response.json();
      const file: ApiFile = json.file;
      toast.success("File upload successfully")
      setProjects((current) =>
        current.map((p) =>
          p.id === openProject.id ? { ...p, files: [file, ...p.files] } : p,
        ),
      );

      setOpenProject((current) =>
        current ? { ...current, files: [file, ...current.files] } : current,
      );

    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Failed to upload file.",
      );
    } finally {
      setIsuploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm("Delete this file? This cannot be undone.")) return;
    const response = await authFetch("/api/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    });
    if (!response.ok) {
      const json = await response.json().catch(() => null);
      window.alert(json?.error || "Could not delete file.");
      return;
    }
    setProjects((current) =>
      current.map((p) => ({
        ...p,
        files: p.files.filter((f) => f.id !== fileId),
      })),
    );
    setOpenProject((current) =>
      current
        ? { ...current, files: current.files.filter((f) => f.id !== fileId) }
        : current,
    );
  };

  const handleShareFile = async (fileId: string) => {
    const email = window.prompt("Share this file with (email):");
    if (!email?.trim()) return;
    const permissionInput = window.prompt(
      "Choose access level: FULL_ACCESS, READ_ONLY, or CAN_EDIT",
      "READ_ONLY",
    );
    if (!permissionInput?.trim()) return;
    const normalized = permissionInput.trim().toUpperCase();
    const permission = normalized === "READ_ONLY" ? "READ_ONLY" : "FULL_ACCESS";
    const response = await authFetch("/api/shared", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileId,
        sharedWithEmail: email.trim(),
        permission,
      }),
    });
    if (!response.ok) {
      const json = await response.json().catch(() => null);
      window.alert(json?.error || "Could not share file.");
      return;
    }
    window.alert("File shared successfully.");
    if (openProject) await loadShareRecipients(openProject.id);
  };

  const handleOpenProject = (project: ApiProject) => {
    setOpenProject(project);
    loadShareRecipients(project.id);
  };

  // ── NEW: Share entire project (all files) ──────────────
  const handleShareProject = async (project: ApiProject, e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (project.files.length === 0) {
      window.alert("This project has no files to share.");
      return;
    }

    const email = window.prompt(`Share all files in "${project.name}" with (email):`);
    if (!email?.trim()) return;

    const permissionInput = window.prompt(
      "Choose access level: FULL_ACCESS or READ_ONLY",
      "READ_ONLY",
    );
    if (!permissionInput?.trim()) return;

    const normalized  = permissionInput.trim().toUpperCase();
    const permission  = normalized === "FULL_ACCESS" ? "FULL_ACCESS" : "READ_ONLY";
    const results     = { success: 0, failed: 0 };

    // Share every file in the project sequentially
    for (const file of project.files) {
      const response = await authFetch("/api/shared", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: file.id,
          sharedWithEmail: email.trim(),
          permission,
        }),
      });
      if (response.ok) {
        results.success++;
      } else {
        results.failed++;
      }
    }

    if (results.failed === 0) {
      toast.success(`Shared all ${results.success} file${results.success !== 1 ? "s" : ""} in "${project.name}" with ${email.trim()}`);
    } else {
      window.alert(`Shared ${results.success} file(s). ${results.failed} failed.`);
    }

    // Refresh share recipients if inside open project
    if (openProject?.id === project.id) {
      await loadShareRecipients(project.id);
    }
  };

  const handleCloseProject = () => setOpenProject(null);

  return (
    <>
    {isUploading ? (
      <div className="flex items-center justify-center min-h-150">
        <div className="loader"></div>
      </div>
    ) : (
      <div className="min-h-screen bg-[#070b14] text-[#e8edf5] font-sans">
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
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

        <div className="relative z-10 p-8 w-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1
                className="text-3xl font-extrabold text-[#f0f4fa] tracking-[-1px] mb-1"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                My Drive
              </h1>
              <p className="text-sm text-white/40 font-light">
                {projects.length} projects · {totalFiles} database files total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateProject}
                className="flex items-center gap-1.5 bg-transparent border border-white/12 hover:border-white/22 text-white/50 hover:text-white/75 text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                New project
              </button>
              <button
                onClick={handleUploadFile}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 transition-all hover:-translate-y-0.5 text-white text-sm font-medium px-4 py-2.5 rounded-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                  <path d="M12 12v9" />
                  <path d="m16 16-4-4-4 4" />
                </svg>
                Upload file
              </button>
            </div>
          </div>

          {/* Search + view toggle */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
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
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${view === v ? "bg-blue-500/15 text-blue-400 border border-blue-500/2" : "text-white/25 hover:text-white/50"}`}
                >
                  {v === "grid" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="7" height="7" x="3" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="14" rx="1" />
                      <rect width="7" height="7" x="3" y="14" rx="1" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="8" x2="21" y1="6" y2="6" />
                      <line x1="8" x2="21" y1="12" y2="12" />
                      <line x1="8" x2="21" y1="18" y2="18" />
                      <line x1="3" x2="3.01" y1="6" y2="6" />
                      <line x1="3" x2="3.01" y1="12" y2="12" />
                      <line x1="3" x2="3.01" y1="18" y2="18" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          )}

          {/* ── OPEN PROJECT VIEW ─────────────────────────── */}
          {openProject ? (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <button
                  onClick={handleCloseProject}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  My Drive
                </button>
                <span className="text-white/20 text-xs">/</span>
                <span className="text-xs text-[#f0f4fa] font-medium">
                  {openProject.name}
                </span>
              </div>

              <div className="bg-white/3 border border-white/8 rounded-xl p-5 mb-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center ${getProjectColorClass(openProject.engine)}`}
                    >
                      <FolderIcon />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2
                          className="text-lg font-bold text-[#f0f4fa] tracking-tight"
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          {openProject.name}
                        </h2>
                        <span
                          className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${ENGINE_STYLE[openProject.engine ?? "UNKNOWN"]}`}
                        >
                          {openProject.engine ?? "Unknown"}
                        </span>
                      </div>
                      <p className="text-xs text-white/35">
                        {openProject.files.length} files · Modified{" "}
                        {formatDate(openProject.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-[10px] text-white/25 mb-1.5">
                        Shared with
                      </p>
                      <div className="flex items-center justify-end">
                        {shareRecipients.length > 0 ? (
                          <>
                            {shareRecipients.slice(0, 3).map((recipient) => (
                              <div
                                key={recipient.email}
                                title={`${recipient.name} — ${recipient.permission === "FULL_ACCESS" ? "Full access" : "Read only"}`}
                                className="w-7 h-7 rounded-full bg-white/10 border-2 border-[#070b14] flex items-center justify-center text-[10px] font-bold text-white shrink-0 -ml-1.5 first:ml-0"
                              >
                                {recipient.name.slice(0, 2).toUpperCase()}
                              </div>
                            ))}
                            {shareRecipients.length > 3 && (
                              <div className="w-7 h-7 rounded-full bg-white/6 border-2 border-[#070b14] flex items-center justify-center text-[10px] text-white/40 -ml-1.5">
                                +{shareRecipients.length - 3}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-[10px] text-white/30">
                            No recipients yet
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Share project — shares all files */}
                      <button
                        onClick={(e) => handleShareProject(openProject, e)}
                        className="flex items-center gap-1 text-[11px] text-violet-400/70 hover:text-violet-300 bg-violet-500/[0.06] hover:bg-violet-500/[0.12] border border-violet-500/[0.15] rounded-lg px-2.5 py-1 transition-all"
                      >
                        <ShareIcon />
                        Share folder
                      </button>
                      {/* Delete project — inside open view, consistent red style */}
                      <button
                        onClick={(e) => handleDeleteProject(openProject, e)}
                        className="flex items-center gap-1 text-[11px] text-red-400/60 hover:text-red-400 bg-red-500/6 hover:bg-red-500/12 border border-red-500/15 rounded-lg px-2.5 py-1 transition-all"
                      >
                        <TrashIcon />
                        Delete project
                      </button>
                      <button
                        onClick={handleUploadFile}
                        className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 bg-blue-500/8 hover:bg-blue-500/[0.14] border border-blue-500/2 rounded-lg px-2.5 py-1 transition-all"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                          <path d="M12 12v9" />
                          <path d="m16 16-4-4-4 4" />
                        </svg>
                        Upload here
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[2fr_70px_100px_120px_100px_80px] gap-3 px-5 py-2.5 border-b border-white/5">
                  {["Name", "Type", "Engine", "Modified", "Size", ""].map(
                    (h) => (
                      <span
                        key={h}
                        className="text-[10px] font-medium text-white/20 uppercase tracking-wider"
                      >
                        {h}
                      </span>
                    ),
                  )}
                </div>
              { openProject.files.length === 0 ? (
                  <div className="p-10 text-center text-sm text-white/30">
                    No files yet — upload the first one.
                  </div>
                ) : (
                  openProject.files.map((file) => (
                    <div
                      key={file.id}
                      className="grid grid-cols-[2fr_70px_100px_120px_100px_80px] gap-3 items-center px-5 py-3 hover:bg-white/3 border-b border-white/5 last:border-0 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            FILE_ICON[file.type] ?? FILE_ICON.OTHER
                          }`}
                        >
                          {file.type}
                        </div>

                        <span className="text-xs font-medium text-white/70 truncate group-hover:text-white/90 transition-colors">
                          {file.name}
                        </span>
                      </div>

                      <span className="text-[11px] text-white/30">
                        {file.type}
                      </span>

                      <span className="text-[11px]">
                        {file.engine ? (
                          <span
                            className={`text-[9px] font-medium border rounded-full px-1.5 py-0.5 ${
                              ENGINE_STYLE[file.engine] ?? ENGINE_STYLE.UNKNOWN
                            }`}
                          >
                            {file.engine}
                          </span>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </span>

                      <span className="text-[11px] text-white/30">
                        {formatDate(file.updatedAt)}
                      </span>

                      <span className="text-[11px] text-white/30">
                        {getFileSizeLabel(file.sizeBytes)}
                      </span>

                      <div className="hidden group-hover:flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => handleShareFile(file.id)}
                          type="button"
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-white/6 hover:bg-white/10 text-white/35 hover:text-white/65 transition-all"
                          title="Share"
                        >
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
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                            <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          type="button"
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-red-500/8 hover:bg-red-500/15 text-red-400/50 hover:text-red-400 transition-all"
                          title="Delete"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <>
              {isLoading ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
                  Loading your drive…
                </div>
              ) : projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
                  No projects found. Create a new project to start storing
                  database files.
                </div>
              ) : view === "grid" ? (
                // ── GRID VIEW ─────────────────────────────────
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map((project) => (
                    // Wrap in div so delete button sits outside the main button
                    <div key={project.id} className="relative group/card">
                      <button
                        onClick={() => handleOpenProject(project)}
                        className="w-full bg-white/3 border border-white/8 hover:border-blue-500/30 hover:bg-blue-500/4 rounded-xl p-4 text-left transition-all hover:-translate-y-0.5"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${getProjectColorClass(project.engine)}`}
                          >
                            <FolderIcon />
                          </div>
                          <div className="flex items-center">
                            {project.files.slice(0, 3).map((file) => (
                              <div
                                key={file.id}
                                title={file.name}
                                className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[9px] text-white/40 font-bold shrink-0 -ml-1.5 first:ml-0 overflow-hidden text-ellipsis whitespace-nowrap"
                              >
                                {file.name.slice(0, 2).toUpperCase()}
                              </div>
                            ))}
                            {project.files.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-[9px] text-white/40 -ml-1.5">
                                +{project.files.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className="text-sm font-semibold text-white/80 group-hover/card:text-white/95 transition-colors mb-1 truncate pr-8"
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          {project.name}
                        </div>
                        <div className="text-[11px] text-white/30 mb-2">
                          {project.files.length} files ·{" "}
                          {formatDate(project.updatedAt)}
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/6 flex items-center justify-between">
                          <div className="flex gap-1">
                            <span
                              className={`text-[9px] font-medium border rounded-full px-2 py-0.5 ${ENGINE_STYLE[project.engine ?? "UNKNOWN"]}`}
                            >
                              {project.engine ?? "Unknown"}
                            </span>
                            {project.files.slice(0, 2).map((file) => (
                              <span
                                key={file.id}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${FILE_ICON[file.type] ?? FILE_ICON.OTHER} bg-white/4`}
                              >
                                {file.type}
                              </span>
                            ))}
                          </div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-white/20 group-hover/card:text-blue-400 transition-colors"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </div>
                      </button>

                      {/* Share button — absolute top-right area on hover */}
                      <button
                        onClick={(e) => handleShareProject(project, e)}
                        className="absolute top-2.5 right-9 w-6 h-6 hidden group-hover/card:flex items-center justify-center rounded-md bg-violet-500/[0.08] hover:bg-violet-500/[0.18] text-violet-400/50 hover:text-violet-300 border border-violet-500/[0.15] transition-all z-10"
                        title="Share project"
                      >
                        <ShareIcon />
                      </button>

                      {/* Delete button — absolute top-right, only on hover, outside the open-project button */}
                      <button
                        onClick={(e) => handleDeleteProject(project, e)}
                        className="absolute top-2.5 right-2.5 w-6 h-6 hidden group-hover/card:flex items-center justify-center rounded-md bg-red-500/8 hover:bg-red-500/18 text-red-400/50 hover:text-red-400 border border-red-500/15 transition-all z-10"
                        title="Delete project"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                // ── LIST VIEW ──────────────────────────────────
                <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[2fr_120px_100px_120px_1fr_80px] gap-4 px-5 py-3 border-b border-white/[0.07]">
                    {[
                      "Project",
                      "Engine",
                      "Files",
                      "Modified",
                      "Members",
                      "",
                    ].map((h) => (
                      <span
                        key={h}
                        className="text-[10px] font-medium text-white/20 uppercase tracking-wider"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="grid grid-cols-[2fr_120px_100px_120px_1fr_80px] gap-4 items-center px-5 py-3.5 hover:bg-white/3 border-b border-white/5 last:border-0 transition-colors group"
                    >
                      {/* Clickable name — only this navigates into the project */}
                      <button
                        onClick={() => handleOpenProject(project)}
                        className="flex items-center gap-3 min-w-0 text-left"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${getProjectColorClass(project.engine)}`}
                        >
                          <FolderIcon className="w-4 h-4" />
                        </div>
                        <span
                          className="text-sm font-medium text-white/70 group-hover:text-white/90 truncate transition-colors"
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          {project.name}
                        </span>
                      </button>

                      <span
                        className={`text-[10px] font-medium border rounded-full px-2 py-0.5 w-fit ${ENGINE_STYLE[project.engine ?? "UNKNOWN"]}`}
                      >
                        {project.engine ?? "Unknown"}
                      </span>
                      <span className="text-xs text-white/30">
                        {project.files.length} files
                      </span>
                      <span className="text-xs text-white/30">
                        {formatDate(project.updatedAt)}
                      </span>

                      <div className="flex items-center">
                        {project.files.slice(0, 4).map((file) => (
                          <div
                            key={file.id}
                            title={file.name}
                            className="w-6 h-6 rounded-full bg-white/8 border-2 border-[#0a0f1c] flex items-center justify-center text-[9px] text-white/40 -ml-1.5 first:ml-0"
                          >
                            {file.name.slice(0, 2).toUpperCase()}
                          </div>
                        ))}
                        {project.files.length > 4 && (
                          <div className="w-6 h-6 rounded-full bg-white/8 border-2 border-[#0a0f1c] flex items-center justify-center text-[9px] text-white/40 -ml-1.5">
                            +{project.files.length - 4}
                          </div>
                        )}
                      </div>

                      {/* Actions column — share + delete on hover + open arrow */}
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => handleShareProject(project, e)}
                          className="w-6 h-6 hidden group-hover:flex items-center justify-center rounded-md bg-violet-500/[0.08] hover:bg-violet-500/[0.18] text-violet-400/50 hover:text-violet-300 border border-violet-500/[0.15] transition-all"
                          title="Share project"
                        >
                          <ShareIcon />
                        </button>
                        <button
                          onClick={(e) => handleDeleteProject(project, e)}
                          className="w-6 h-6 hidden group-hover:flex items-center justify-center rounded-md bg-red-500/8 hover:bg-red-500/18 text-red-400/50 hover:text-red-400 border border-red-500/15 transition-all"
                          title="Delete project"
                        >
                          <TrashIcon />
                        </button>
                        <button onClick={() => handleOpenProject(project)}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-white/20 group-hover:text-blue-400 transition-colors"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
};

export default Content;
