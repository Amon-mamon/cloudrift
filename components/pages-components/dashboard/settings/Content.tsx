"use client";

import { useState } from "react";

type Tab = "profile" | "preferences" | "storage" | "security" | "danger";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile",     label: "Profile"      },
  { id: "preferences", label: "Preferences"  },
  { id: "storage",     label: "Storage"      },
  { id: "security",    label: "Security"     },
  { id: "danger",      label: "Danger Zone"  },
];

interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
}

const Toggle = ({ enabled, onChange }: ToggleProps) => (
  <button
    onClick={onChange}
    className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
      enabled ? "bg-blue-600" : "bg-white/[0.10]"
    } border ${enabled ? "border-blue-500/50" : "border-white/[0.12]"}`}
  >
    <span
      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
        enabled ? "left-[22px]" : "left-0.5"
      }`}
    />
  </button>
);
const Content = () => {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile state
  const [displayName, setDisplayName] = useState("Juan dela Cruz");
  const [email, setEmail]             = useState("juan@email.com");

  // Preferences state
  const [prefs, setPrefs] = useState({
    emailNotifications:  true,
    aiAutoSummarize:     true,
    aiAutoTag:           false,
    shareActivity:       true,
    weeklyDigest:        false,
  });

  // Security state
  const [twoFactor, setTwoFactor]     = useState(false);
  const [sessionAlerts, setSession]   = useState(true);

  const togglePref = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="min-h-screen bg-[#070b14] text-[#e8edf5] font-sans">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[90px] bg-blue-600" style={{ top: "-120px", left: "140px" }} />
        <div className="absolute w-[360px] h-[360px] rounded-full opacity-15 blur-[80px] bg-emerald-600" style={{ top: "60px", right: "-60px" }} />
        <div className="absolute w-[260px] h-[260px] rounded-full opacity-10 blur-[70px] bg-violet-700" style={{ bottom: "60px", left: "45%" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(56,138,221,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56,138,221,0.05) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      <div className="relative z-10 p-8 w-full">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#f0f4fa] tracking-[-1px] mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
            Settings
          </h1>
          <p className="text-sm text-white/40 font-light">Manage your account and preferences</p>
        </div>

        <div className="flex gap-6">

          {/* Sidebar tabs */}
          <div className="flex-shrink-0 w-44">
            <nav className="flex flex-col gap-0.5">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? tab.id === "danger"
                        ? "bg-red-500/[0.10] text-red-400 border border-red-500/[0.2]"
                        : "bg-blue-500/[0.15] text-blue-300 border border-blue-500/[0.2]"
                      : tab.id === "danger"
                        ? "text-red-400/50 hover:text-red-400/80 hover:bg-red-500/[0.06] border border-transparent"
                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* ── PROFILE ────────────────────────────────── */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                {/* Avatar card */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-white/55 mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>Profile picture</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                      JD
                    </div>
                    <div>
                      <button className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] hover:border-white/[0.18] text-white/55 hover:text-white/75 text-xs font-medium px-3.5 py-2 rounded-xl transition-all mb-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
                        Upload photo
                      </button>
                      <p className="text-[10px] text-white/22">JPG, PNG or GIF · Max 2MB</p>
                    </div>
                  </div>
                </div>

                {/* Profile fields */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden">
                  <h2 className="text-sm font-semibold text-white/55 px-5 py-4 border-b border-white/[0.07]" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Personal info
                  </h2>
                  {[
                    { label: "Display name", desc: "Your name visible to collaborators", value: displayName, onChange: setDisplayName },
                    { label: "Email address", desc: "Used to sign in and receive notifications", value: email, onChange: setEmail },
                  ].map((field) => (
                    <div key={field.label} className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] last:border-0">
                      <div>
                        <div className="text-sm font-medium text-white/70">{field.label}</div>
                        <div className="text-[11px] text-white/30 mt-0.5">{field.desc}</div>
                      </div>
                      <input
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="bg-white/[0.04] border border-white/[0.10] rounded-xl px-3 py-2 text-xs text-[#e8edf5] placeholder-white/20 outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-colors w-52"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button className="bg-blue-600 hover:bg-blue-500 transition-all hover:-translate-y-0.5 text-white text-sm font-medium px-5 py-2.5 rounded-xl">
                    Save changes
                  </button>
                </div>
              </div>
            )}

            {/* ── PREFERENCES ────────────────────────────── */}
            {activeTab === "preferences" && (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden">
                <h2 className="text-sm font-semibold text-white/55 px-5 py-4 border-b border-white/[0.07]" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Notifications & AI
                </h2>
                {[
                  { key: "emailNotifications" as const, label: "Email notifications",  desc: "Receive alerts when files are shared or modified"       },
                  { key: "aiAutoSummarize"    as const, label: "AI auto-summarize",    desc: "Automatically summarize uploaded documents with AI"      },
                  { key: "aiAutoTag"          as const, label: "AI auto-tag",          desc: "Automatically categorize and tag files on upload"        },
                  { key: "shareActivity"      as const, label: "Share activity alerts", desc: "Get notified when collaborators access your files"      },
                  { key: "weeklyDigest"       as const, label: "Weekly digest",        desc: "Receive a weekly summary of your storage activity"       },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] last:border-0 group hover:bg-white/[0.02] transition-colors">
                    <div>
                      <div className="text-sm font-medium text-white/70 group-hover:text-white/85 transition-colors">{item.label}</div>
                      <div className="text-[11px] text-white/30 mt-0.5">{item.desc}</div>
                    </div>
                    <Toggle enabled={prefs[item.key]} onChange={() => togglePref(item.key)} />
                  </div>
                ))}
              </div>
            )}

            {/* ── STORAGE ────────────────────────────────── */}
            {activeTab === "storage" && (
              <div className="space-y-4">
                {/* Current plan */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-semibold text-white/55 mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Current plan</h2>
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-blue-300 bg-blue-500/10 border border-blue-500/25 rounded-full px-3 py-1">
                        Free Plan — 10 GB
                      </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-500 transition-all hover:-translate-y-0.5 text-white text-sm font-medium px-4 py-2 rounded-xl">
                      Upgrade to Pro
                    </button>
                  </div>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-2xl font-bold text-[#f0f4fa]" style={{ fontFamily: "'Syne', sans-serif" }}>4.2 GB</span>
                    <span className="text-xs text-white/30">of 10 GB used</span>
                  </div>
                  <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
                    <div className="h-full w-[42%] bg-blue-500 rounded-full" />
                  </div>
                </div>

                {/* Breakdown */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden">
                  <h2 className="text-sm font-semibold text-white/55 px-5 py-4 border-b border-white/[0.07]" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Storage breakdown
                  </h2>
                  {[
                    { label: "Documents",    size: "1.8 GB", pct: 18, color: "bg-blue-500"    },
                    { label: "Images",       size: "1.2 GB", pct: 12, color: "bg-emerald-500" },
                    { label: "Archives",     size: "0.9 GB", pct: 9,  color: "bg-amber-500"   },
                    { label: "Other",        size: "0.3 GB", pct: 3,  color: "bg-violet-500"  },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.05] last:border-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`} />
                      <span className="text-sm text-white/65 flex-1">{item.label}</span>
                      <div className="w-32 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.pct / 42) * 100}%` }} />
                      </div>
                      <span className="text-xs text-white/35 w-14 text-right">{item.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECURITY ───────────────────────────────── */}
            {activeTab === "security" && (
              <div className="space-y-4">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden">
                  <h2 className="text-sm font-semibold text-white/55 px-5 py-4 border-b border-white/[0.07]" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Security settings
                  </h2>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                    <div>
                      <div className="text-sm font-medium text-white/70">Two-factor authentication</div>
                      <div className="text-[11px] text-white/30 mt-0.5">Add an extra layer of security to your account</div>
                    </div>
                    <Toggle enabled={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
                  </div>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                    <div>
                      <div className="text-sm font-medium text-white/70">Login alerts</div>
                      <div className="text-[11px] text-white/30 mt-0.5">Get notified of new sign-ins to your account</div>
                    </div>
                    <Toggle enabled={sessionAlerts} onChange={() => setSession(!sessionAlerts)} />
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <div>
                      <div className="text-sm font-medium text-white/70">Change password</div>
                      <div className="text-[11px] text-white/30 mt-0.5">Last changed 3 months ago</div>
                    </div>
                    <button className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] hover:border-white/[0.18] text-white/55 hover:text-white/75 text-xs font-medium px-3.5 py-2 rounded-xl transition-all">
                      Update password
                    </button>
                  </div>
                </div>

                {/* Active sessions */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden">
                  <h2 className="text-sm font-semibold text-white/55 px-5 py-4 border-b border-white/[0.07]" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Active sessions
                  </h2>
                  {[
                    { device: "Chrome on Windows",  location: "Manila, PH",    time: "Now (current)",   current: true  },
                    { device: "Safari on iPhone",    location: "Manila, PH",    time: "2 hours ago",     current: false },
                    { device: "Firefox on MacOS",    location: "Cebu, PH",      time: "3 days ago",      current: false },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.current ? "bg-emerald-400" : "bg-white/20"}`} />
                        <div>
                          <div className="text-xs font-medium text-white/65">{s.device}</div>
                          <div className="text-[10px] text-white/28 mt-0.5">{s.location} · {s.time}</div>
                        </div>
                      </div>
                      {!s.current && (
                        <button className="text-[10px] text-red-400/60 hover:text-red-400 bg-red-500/[0.06] hover:bg-red-500/[0.12] border border-red-500/[0.15] rounded-lg px-2.5 py-1 transition-all">
                          Revoke
                        </button>
                      )}
                      {s.current && <span className="text-[10px] text-emerald-400/70 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">This device</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── DANGER ZONE ────────────────────────────── */}
            {activeTab === "danger" && (
              <div className="space-y-4">
                <div className="bg-white/[0.03] border border-red-500/[0.15] rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-red-500/[0.10]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    <h2 className="text-sm font-semibold text-red-400/80" style={{ fontFamily: "'Syne', sans-serif" }}>Danger zone</h2>
                  </div>

                  {[
                    {
                      label: "Clear all files",
                      desc:  "Permanently delete all your uploaded files. This cannot be undone.",
                      btn:   "Clear files",
                    },
                    {
                      label: "Revoke all shared access",
                      desc:  "Remove access for all collaborators across all your files.",
                      btn:   "Revoke all",
                    },
                    {
                      label: "Delete account",
                      desc:  "Permanently delete your account, all files, and all data. This cannot be undone.",
                      btn:   "Delete account",
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-5 py-4 border-b border-red-500/[0.08] last:border-0">
                      <div>
                        <div className="text-sm font-medium text-white/65">{item.label}</div>
                        <div className="text-[11px] text-white/28 mt-0.5 max-w-xs">{item.desc}</div>
                      </div>
                      <button className="flex-shrink-0 text-xs font-medium text-red-400 bg-red-500/[0.08] hover:bg-red-500/[0.15] border border-red-500/[0.2] rounded-xl px-3.5 py-2 transition-all">
                        {item.btn}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Content;