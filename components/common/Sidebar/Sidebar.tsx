"use client";

import { CustomButton } from "@/components/reusable/button/CustomButton";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
const MuiTooltip = dynamic(() => import("@mui/material/Tooltip"));




const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
    path:"/dashboard/"
  },
  {
    label: "My Drive",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>,
    path:"/dashboard/drive"
  },
  {
    label: "AI Insights",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
    badge: "New",
    path:""
  },
  {
    label: "Shared",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
   path:""
  },
  {
    label: "Settings",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
    path:""
  },
];

const RECENT_FILES = [
  { name: "Q3_Report.pdf",        color: "text-red-400"     },
  { name: "design_mockups.png",   color: "text-emerald-400" },
  { name: "project_notes.docx",   color: "text-blue-400"    },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar =({ collapsed, onToggle }: DashboardSidebarProps) =>  {
  const [active, setActive] = useState("Dashboard");

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0  top-18.25 bottom-0 bg-[#070b14]/90 backdrop-blur-xl border-r border-white/[0.07] flex flex-col z-20 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${
          collapsed ? "w-15" : "w-56"
        }`}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(56,138,221,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56,138,221,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Toggle CustomButton — sits at top of sidebar */}
        <div className="relative flex items-center justify-end px-3 pt-4 pb-2">
          <CustomButton tooltip="Toggle Sidebar"
            onClick={onToggle}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/4 hover:bg-white/8 border border-white/8 hover:border-white/[0.14] text-white/30 hover:text-white/60 transition-all"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {/* Chevron flips direction based on collapsed state */}
            <svg
              xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </CustomButton>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 px-2 space-y-0.5">
          {!collapsed && (
            <p className="text-[10px] font-medium text-white/20 uppercase tracking-widest px-3 pb-2">
              Menu
            </p>
          )}
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.label;
            return (
             <MuiTooltip key={item.label} title={!collapsed ? item.label : ""}>
               <Link href={item.path}
                key={item.label}
                onClick={() => setActive(item.label)}
                className={`w-full flex items-center gap-3 rounded-xl font-medium transition-all text-left group ${
                  collapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-blue-500/15 text-blue-300 border border-blue-500/20"
                    : "text-white/40 hover:text-white/70 hover:bg-white/4 border border-transparent"
                }`}
              >
                <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
                  <span className={`shrink-0 transition-colors ${isActive ? "text-blue-400" : "text-white/25 group-hover:text-white/45"}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="text-sm whitespace-nowrap">{item.label}</span>
                  )}
                </div>
                {!collapsed && item.badge && (
                  <span className="text-[9px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/25 rounded-full px-1.5 py-0.5">
                    {item.badge}
                  </span>
                )}
              </Link>
             </MuiTooltip>
            );
          })}

          {/* Recent files — hidden when collapsed */}
          {!collapsed && (
            <div className="pt-5">
              <p className="text-[10px] font-medium text-white/20 uppercase tracking-widest px-3 pb-2">
                Recent
              </p>
              {RECENT_FILES.map((file) => (
                <CustomButton tooltip="Recent Files"
                  key={file.name}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-white/4 transition-colors group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${file.color}`}>
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                  </svg>
                  <span className="text-xs text-white/30 group-hover:text-white/55 truncate transition-colors">
                    {file.name}
                  </span>
                </CustomButton>
              ))}
            </div>
          )}
        </nav>

        {/* Storage — collapsed shows just icon */}
        <div className="relative p-2">
          {collapsed ? (
            <CustomButton tooltip="Storage"
              title="Storage: 4.2 / 10 GB"
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-white/3 border border-white/8 hover:border-blue-500/25 hover:bg-blue-500/6 transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 group-hover:text-blue-400 transition-colors">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
              </svg>
            </CustomButton>
          ) : (
            <div className="bg-white/3 border border-white/8 rounded-xl p-3.5 hover:border-white/12 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-white/45">Storage</span>
                <span className="text-[10px] text-white/22">4.2 / 10 GB</span>
              </div>
              <div className="h-1 bg-white/8 rounded-full overflow-hidden mb-3">
                <div className="h-full w-[42%] bg-blue-500 rounded-full" />
              </div>
              <CustomButton  tooltip="Upgrade Storage" className="w-full text-[10px] font-medium text-blue-400 hover:text-blue-300 bg-blue-500/8 hover:bg-blue-500/[0.14] border border-blue-500/20 rounded-lg py-1.5 transition-all">
                Upgrade storage ↑
              </CustomButton>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar