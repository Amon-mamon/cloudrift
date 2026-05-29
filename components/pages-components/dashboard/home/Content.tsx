"use client";

const STATS = [
  {
    label: "Total Files",
    value: "128",
    sub: "+12 this week",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>,
    iconBg: "bg-blue-500/10 text-blue-400",
    trend: "up",
  },
  {
    label: "Storage Used",
    value: "4.2 GB",
    sub: "of 10 GB free plan",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>,
    iconBg: "bg-emerald-500/10 text-emerald-400",
    trend: "neutral",
  },
  {
    label: "Shared Files",
    value: "24",
    sub: "with 6 people",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    iconBg: "bg-violet-500/10 text-violet-400",
    trend: "up",
  },
  {
    label: "AI Summaries",
    value: "37",
    sub: "files analyzed",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
    iconBg: "bg-amber-500/10 text-amber-400",
    trend: "up",
  },
];

const RECENT_FILES = [
  { name: "Q3_Report_2025.pdf",   ext: "PDF", size: "2.4 MB", modified: "2 hours ago",  iconColor: "bg-red-500/10 text-red-400",     ai: true  },
  { name: "design_mockups.png",   ext: "IMG", size: "1.1 MB", modified: "5 hours ago",  iconColor: "bg-emerald-500/10 text-emerald-400", ai: false },
  { name: "project_notes.docx",   ext: "DOC", size: "340 KB", modified: "Yesterday",    iconColor: "bg-blue-500/10 text-blue-400",    ai: true  },
  { name: "source_code_v2.zip",   ext: "ZIP", size: "8.7 MB", modified: "2 days ago",   iconColor: "bg-amber-500/10 text-amber-400",  ai: false },
  { name: "meeting_recap.pdf",    ext: "PDF", size: "512 KB", modified: "3 days ago",   iconColor: "bg-red-500/10 text-red-400",     ai: true  },
];

const AI_ACTIVITY = [
  { file: "Q3_Report_2025.pdf",   action: "Summarized 24-page report into key insights",      time: "2h ago",  dot: "bg-blue-400"    },
  { file: "project_notes.docx",   action: "Auto-tagged: Planning, Development, Q4",           time: "5h ago",  dot: "bg-emerald-400" },
  { file: "meeting_recap.pdf",    action: "Extracted 6 action items from meeting notes",      time: "1d ago",  dot: "bg-amber-400"   },
];

const Content = () => {
  return (
    <div className="pt-18.25 min-h-screen bg-[#070b14] text-[#e8edf5] font-sans w-full">

      {/* Background — same orbs + grid as hero */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 w-full">
        <div className="absolute w-125 h-125 rounded-full opacity-20 blur-[90px] bg-blue-600" style={{ top: "-120px", left: "140px" }} />
        <div className="absolute w-90 h-90 rounded-full opacity-15 blur-[80px] bg-emerald-600" style={{ top: "60px", right: "-60px" }} />
        <div className="absolute w-65 h-65 rounded-full opacity-10 blur-[70px] bg-violet-700" style={{ bottom: "60px", left: "45%" }} />
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
              className="text-3xl font-extrabold text-[#f0f4fa] tracking-[-1px] mb-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Good morning, Juan 👋
            </h1>
            <p className="text-sm text-white/40 font-light">
              Here's what's happening in your CloudRift today.
            </p>
          </div>

          {/* Upload — matches hero primary CTA exactly */}
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-all hover:-translate-y-0.5 text-white font-medium px-5 py-2.5 rounded-xl text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
            </svg>
            Upload file
          </button>
        </div>

        {/* Stat cards — same card style as hero stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="group bg-white/3 border border-white/8 hover:border-blue-500/30 hover:bg-blue-500/4 rounded-xl p-4 transition-all cursor-default"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
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
              <h2 className="text-sm font-semibold text-white/60" style={{ fontFamily: "'Syne', sans-serif" }}>
                Recent Files
              </h2>
              <button className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                View all →
              </button>
            </div>

            <div className="divide-y divide-white/5">
              {RECENT_FILES.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors group"
                >
                  {/* Same file icon style as hero mockup */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${file.iconColor}`}>
                    {file.ext}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white/70 truncate group-hover:text-white/90 transition-colors">
                      {file.name}
                    </div>
                    <div className="text-[10px] text-white/25 mt-0.5">{file.modified} · {file.size}</div>
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    </button>
                    <button className="w-6 h-6 flex items-center justify-center rounded-md bg-white/6 hover:bg-white/10 text-white/35 hover:text-white/65 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
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
              <h2 className="text-sm font-semibold text-white/60 mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
                Storage
              </h2>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-[#f0f4fa]" style={{ fontFamily: "'Syne', sans-serif" }}>
                  4.2 GB
                </span>
                <span className="text-xs text-white/25">of 10 GB</span>
              </div>
              {/* Same progress bar as hero */}
              <div className="h-1 bg-white/8 rounded-full overflow-hidden mb-3">
                <div className="h-full w-[42%] bg-blue-500 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: "Docs",   pct: "18%", color: "bg-blue-400"    },
                  { label: "Images", pct: "12%", color: "bg-emerald-400" },
                  { label: "Other",  pct: "12%", color: "bg-amber-400"   },
                ].map((t) => (
                  <div key={t.label} className="text-center">
                    <div className={`w-1.5 h-1.5 rounded-full ${t.color} mx-auto mb-1`} />
                    <div className="text-[10px] text-white/30">{t.label}</div>
                    <div className="text-[11px] font-medium text-white/50">{t.pct}</div>
                  </div>
                ))}
              </div>
              {/* Matches hero secondary button */}
              <button className="w-full text-[11px] font-medium text-blue-400 hover:text-blue-300 bg-blue-500/8 hover:bg-blue-500/[0.14] border border-blue-500/20 rounded-xl py-2 transition-all">
                Upgrade to Pro ↑
              </button>
            </div>

            {/* AI Activity — uses hero AI badge colors */}
            <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden flex-1">
              <div className="flex items-center gap-2 px-4 py-4 border-b border-white/[0.07]">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
                <h2 className="text-sm font-semibold text-white/60" style={{ fontFamily: "'Syne', sans-serif" }}>
                  AI Activity
                </h2>
              </div>
              <div className="p-3 space-y-1">
                {AI_ACTIVITY.map((item) => (
                  <div key={item.file} className="flex gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-colors group cursor-default">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.dot} mt-1.5 shrink-0`} />
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-white/55 truncate group-hover:text-white/75 transition-colors">{item.file}</div>
                      <div className="text-[10px] text-white/28 mt-0.5 leading-relaxed">{item.action}</div>
                      <div className="text-[9px] text-white/18 mt-1">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Drop zone — matches hero feature card hover style */}
        <div className="mt-5 border border-dashed border-white/10 hover:border-blue-500/40 hover:bg-blue-500/4 rounded-xl p-7 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-white/3 group-hover:bg-blue-500/10 border border-white/8 group-hover:border-blue-500/25 flex items-center justify-center transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/25 group-hover:text-blue-400 transition-colors">
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
            </svg>
          </div>
          <div className="text-sm font-medium text-white/35 group-hover:text-white/55 transition-colors">
            Drop files here to upload
          </div>
          <div className="text-[11px] text-white/20">or click to browse — any file type supported</div>
        </div>
      </div>
    </div>
  );
}

export default Content