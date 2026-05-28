import Register from "@/components/auth/register/Register";
import Header from "@/components/common/Header/Header";
import { CustomButton } from "@/components/reusable/button/CustomButton";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
const NAV_LINKS = ["Features", "Pricing", "About"];

const FEATURES = [
  {
    icon: (
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
      >
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
        <path d="M12 12v9" />
        <path d="m16 16-4-4-4 4" />
      </svg>
    ),
    color: "bg-blue-500/10 text-blue-400",
    title: "Easy uploads",
    desc: "Drag & drop any file type instantly",
  },
  {
    icon: (
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
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
      </svg>
    ),
    color: "bg-emerald-500/10 text-emerald-400",
    title: "AI assistant",
    desc: "Summarize & search with natural language",
  },
  {
    icon: (
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
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "bg-violet-500/10 text-violet-400",
    title: "Multi-user",
    desc: "Share & collaborate with anyone",
  },
  {
    icon: (
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
      >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    color: "bg-amber-500/10 text-amber-400",
    title: "Secure vault",
    desc: "End-to-end encrypted, always private",
  },
];

const FILES = [
  {
    name: "Q3_Report_2025.pdf",
    size: "2.4 MB",
    tag: "AI Summary",
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    iconColor: "bg-red-500/10 text-red-400",
    ext: "PDF",
  },
  {
    name: "design_mockups.png",
    size: "1.1 MB",
    tag: "Tagged",
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    iconColor: "bg-green-500/10 text-green-400",
    ext: "IMG",
  },
  {
    name: "project_notes.docx",
    size: "340 KB",
    tag: "AI Summary",
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    iconColor: "bg-blue-500/10 text-blue-400",
    ext: "DOC",
  },
  {
    name: "source_code_v2.zip",
    size: "8.7 MB",
    tag: null,
    tagColor: "",
    iconColor: "bg-amber-500/10 text-amber-400",
    ext: "ZIP",
  },
];

const STATS = [
  { value: "10 GB", label: "Free storage" },
  { value: "256-bit", label: "Encryption" },
  { value: "AI-ready", label: "Smart file analysis" },
];

const Content = () => {
  const [isOpen, setIsOpen] = useState(false);

  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame: number;
    let t = 0;
    const animate = () => {
      t += 0.005;
      if (orb1Ref.current) {
        orb1Ref.current.style.transform = `translate(${Math.sin(t) * 20}px, ${Math.cos(t) * 15}px)`;
      }
      if (orb2Ref.current) {
        orb2Ref.current.style.transform = `translate(${Math.cos(t) * -15}px, ${Math.sin(t) * 20}px)`;
      }
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div className=" min-h-screen bg-[#070b14] text-[#e8edf5] overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          ref={orb1Ref}
          className="absolute w-125 h-125 rounded-full opacity-20 blur-[90px] bg-blue-600"
          style={{ top: "-120px", left: "-80px" }}
        />
        <div
          ref={orb2Ref}
          className="absolute w-90 h-90 rounded-full opacity-15 blur-[80px] bg-emerald-600"
          style={{ top: "60px", right: "-60px" }}
        />
        <div
          className="absolute w-65 h-65 rounded-full opacity-10 blur-[70px] bg-violet-700"
          style={{ bottom: "60px", left: "35%" }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(56,138,221,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56,138,221,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-white/[0.07]">
        <div
          className="flex items-center gap-2 font-bold text-xl tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse inline-block" />
          CloudRift
        </div>
        <ul className="hidden md:flex gap-8 list-none m-0 p-0">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a
                href="#"
                className="text-md text-white/40 hover:text-white/80 transition-colors no-underline"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
        <Link href="/auth/register"
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-medium px-5 py-2 rounded-lg"
        >
          Sign up free
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-12">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 rounded-full px-4 py-1.5 text-xs text-blue-300 font-medium mb-8 tracking-wide">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
          AI-powered file storage — now in beta
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.07] tracking-[-2px] max-w-3xl mb-6 text-[#f0f4fa]"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Store, Share & <span className="text-blue-400">Understand</span> Your
          Files with <span className="text-emerald-400">AI</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-white/45 max-w-lg leading-relaxed mb-10 font-light">
          CloudRift gives everyone a smart cloud drive. Upload anything, let AI
          summarize and organize it — then access it from anywhere.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center mb-14">
          <CustomButton className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-all hover:-translate-y-0.5 text-white font-medium px-7 py-3.5 rounded-xl text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
            Get started free
          </CustomButton>
          <CustomButton className="flex items-center gap-2 bg-transparent border border-white/15 hover:border-white/30 text-white/70 hover:text-white transition-all hover:-translate-y-0.5 font-normal px-7 py-3.5 rounded-xl text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
            Watch demo
          </CustomButton>
        </div>

        {/* App Mockup */}
        <div className="w-full max-w-2xl bg-white/3 border border-white/10 rounded-2xl overflow-hidden mb-6">
          {/* Window bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-white/4 border-b border-white/[0.07]">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <div className="flex-1 mx-4 bg-white/5 rounded-md py-1 px-3 text-xs text-white/25 text-center">
              app.cloudrift.io/drive
            </div>
          </div>

          {/* App body */}
          <div className="grid grid-cols-[180px_1fr] gap-4 p-4 min-h-55">
            {/* Sidebar */}
            <div className="bg-white/3 border border-white/[0.07] rounded-xl p-3 flex flex-col gap-1">
              {[
                { label: "My Drive", active: true },
                { label: "Shared", active: false },
                { label: "AI Insights", active: false },
                { label: "Recent", active: false },
                { label: "Trash", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-default transition-colors ${
                    item.active
                      ? "bg-blue-500/15 text-blue-300"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {item.label}
                </div>
              ))}
              {/* Storage bar */}
              <div className="mt-auto p-2 bg-blue-500/8 border border-blue-500/20 rounded-lg">
                <div className="text-[10px] text-white/35 mb-1.5">
                  Storage used
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[42%] bg-blue-500 rounded-full" />
                </div>
                <div className="text-[10px] text-white/30 mt-1">
                  4.2 GB of 10 GB
                </div>
              </div>
            </div>

            {/* File list */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-white/50">
                  My Files
                </span>
                <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/25 rounded-md px-2.5 py-1 text-[11px] text-blue-300 cursor-default">
                  ↑ Upload
                </div>
              </div>
              {FILES.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-2.5 bg-white/3 border border-white/6 rounded-lg px-3 py-2"
                >
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${file.iconColor}`}
                  >
                    {file.ext}
                  </div>
                  <span className="flex-1 text-xs text-white/70 truncate">
                    {file.name}
                  </span>
                  {file.tag && (
                    <span
                      className={`text-[10px] border rounded px-1.5 py-0.5 shrink-0 ${file.tagColor}`}
                    >
                      {file.tag}
                    </span>
                  )}
                  <span className="text-[11px] text-white/25 shrink-0">
                    {file.size}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-2xl mb-12">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-white/3 border border-white/8 rounded-xl py-4 px-5 text-center"
            >
              <span
                className="block text-2xl font-bold text-[#f0f4fa] mb-1"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {s.value}
              </span>
              <span className="text-xs text-white/35">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group bg-white/3 border border-white/8 hover:border-blue-500/30 hover:bg-blue-500/4 rounded-xl p-4 flex flex-col gap-2.5 transition-all cursor-default text-left"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${f.color}`}
              >
                {f.icon}
              </div>
              <div className="text-[13px] font-medium text-white/85">
                {f.title}
              </div>
              <div className="text-[11px] text-white/35 leading-relaxed">
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>
        {/* <Register open={isOpen} onClose={() => setIsOpen(false)} /> */}
    </div>
  );
};

export default Content;
