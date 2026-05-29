"use client";

import { useState } from "react";

const MOCK_USER = {
  name: "Juan dela Cruz",
  email: "juan@email.com",
  avatar: "JD",
};

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-10 py-5 bg-[#070b14]/80 backdrop-blur-xl border-b border-white/[0.07]">
      {/* Logo — identical to hero */}
      <div
        className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-[#f0f4fa]"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse inline-block" />
        CloudRift
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/3 hover:bg-white/6 border border-white/[0.07] hover:border-white/12 text-white/35 hover:text-white/60 transition-all">
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
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-400" />
        </button>

        {/* Upload CTA — matches hero primary button style */}
        <button className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 transition-all hover:-translate-y-0.5 text-white text-sm font-medium px-4 py-2 rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
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
          Upload
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 bg-white/3 hover:bg-white/6 border border-white/[0.07] hover:border-white/12 rounded-xl px-3 py-2 transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {MOCK_USER.avatar}
            </div>
            <span className="hidden sm:block text-xs font-medium text-white/60 max-w-25 truncate">
              {MOCK_USER.name}
            </span>
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
              className={`text-white/25 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              {/* Click-away */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-[#0f1623] border border-white/9 rounded-2xl shadow-2xl overflow-hidden z-20">
                {/* User info */}
                <div className="px-4 py-3.5 border-b border-white/[0.07]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {MOCK_USER.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white/80 truncate">
                        {MOCK_USER.name}
                      </div>
                      <div className="text-[10px] text-white/35 truncate">
                        {MOCK_USER.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="py-1.5">
                  {[
                    {
                      label: "My Profile",
                      icon: (
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
                          <circle cx="12" cy="8" r="5" />
                          <path d="M20 21a8 8 0 1 0-16 0" />
                        </svg>
                      ),
                    },
                    {
                      label: "Settings",
                      icon: (
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
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ),
                    },
                    {
                      label: "Upgrade Plan",
                      icon: (
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
                          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                        </svg>
                      ),
                      accent: true,
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors text-left ${
                        item.accent
                          ? "text-blue-400 hover:bg-blue-500/8"
                          : "text-white/45 hover:text-white/75 hover:bg-white/4"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="border-t border-white/[0.07] py-1.5">
                  <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/6 transition-colors text-left">
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
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default Header;
