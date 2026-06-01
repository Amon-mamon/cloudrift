"use client";

import { useState } from "react";

type DiffState = "idle" | "loading" | "done" | "error";

interface DiffChange {
  type: "added" | "removed" | "modified";
  description: string;
  impact: "low" | "medium" | "high";
}

interface DiffResult {
  summary: string;
  totalChanges: number;
  added: DiffChange[];
  removed: DiffChange[];
  modified: DiffChange[];
  breakingChanges: string[];
  recommendations: string[];
}

const IMPACT_STYLE: Record<string, string> = {
  low:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high:   "bg-red-500/10 text-red-400 border-red-500/20",
};

const SAMPLE_V1 = `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10,2),
  stock INT DEFAULT 0
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);`;

const SAMPLE_V2 = `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(150),
  phone VARCHAR(20),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  category_id INT,
  sku VARCHAR(100) UNIQUE
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  total DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_id INT REFERENCES categories(id)
);`;

const Content = () => {
  const [schemaV1, setSchemaV1] = useState("");
  const [schemaV2, setSchemaV2] = useState("");
  const [state, setState]       = useState<DiffState>("idle");
  const [result, setResult]     = useState<DiffResult | null>(null);
  const [error, setError]       = useState("");

  const loadSample = () => {
    setSchemaV1(SAMPLE_V1);
    setSchemaV2(SAMPLE_V2);
  };

  const runDiff = async () => {
    if (!schemaV1.trim() || !schemaV2.trim()) return;
    setState("loading");
    setResult(null);
    setError("");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a database migration expert. Compare these two SQL schemas and return ONLY a JSON object — no markdown, no backticks, no extra text.

Schema V1 (old):
${schemaV1.slice(0, 2000)}

Schema V2 (new):
${schemaV2.slice(0, 2000)}

Return this exact JSON structure:
{
  "summary": "2-3 sentence plain English overview of what changed",
  "totalChanges": 8,
  "added": [{ "type": "added", "description": "what was added", "impact": "low|medium|high" }],
  "removed": [{ "type": "removed", "description": "what was removed", "impact": "low|medium|high" }],
  "modified": [{ "type": "modified", "description": "what was changed and how", "impact": "low|medium|high" }],
  "breakingChanges": ["description of any breaking changes that could affect existing data or queries"],
  "recommendations": ["migration advice or things to watch out for"]
}`
          }]
        }),
      });

      const data = await response.json();
      const text = data.content?.map((c: { type: string; text?: string }) => c.type === "text" ? c.text : "").join("") ?? "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed: DiffResult = JSON.parse(clean);
      setResult(parsed);
      setState("done");
    } catch {
      setError("Failed to compare schemas. Please check your input and try again.");
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setResult(null);
    setError("");
    setSchemaV1("");
    setSchemaV2("");
  };

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
            <div className="inline-flex items-center gap-1.5 text-[11px] text-blue-300 bg-blue-500/10 border border-blue-500/25 rounded-full px-3 py-1 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              AI Tools · Schema Diff
            </div>
            <h1 className="text-3xl font-extrabold text-[#f0f4fa] tracking-[-1px] mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
              Schema Diff
            </h1>
            <p className="text-sm text-white/40 font-light">
              Paste two versions of a schema — AI explains every change and flags breaking ones
            </p>
          </div>
          <div className="flex items-center gap-2">
            {state === "done" && (
              <button onClick={reset} className="flex items-center gap-1.5 bg-white/3 hover:bg-white/6 border border-white/10 text-white/50 hover:text-white/75 text-sm font-medium px-4 py-2.5 rounded-xl transition-all">
                ← Compare again
              </button>
            )}
            {state === "idle" && (
              <button onClick={loadSample} className="flex items-center gap-1.5 bg-white/3 hover:bg-white/6 border border-white/10 text-white/50 hover:text-white/75 text-xs font-medium px-3.5 py-2 rounded-xl transition-all">
                Load sample
              </button>
            )}
          </div>
        </div>

        {/* Input panels */}
        {state !== "done" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
              {/* V1 */}
              <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-white/[0.07]">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <h2 className="text-sm font-semibold text-white/55" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Schema V1
                  </h2>
                  <span className="text-[10px] text-white/25 ml-auto">Old / current version</span>
                </div>
                <div className="p-3">
                  <textarea
                    value={schemaV1}
                    onChange={(e) => setSchemaV1(e.target.value)}
                    placeholder={`CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255),\n  ...\n);`}
                    className="w-full h-64 bg-black/20 border border-white/[0.07] rounded-xl px-4 py-3 text-xs text-white/65 font-mono placeholder-white/15 outline-none focus:border-red-500/30 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* V2 */}
              <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-white/[0.07]">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h2 className="text-sm font-semibold text-white/55" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Schema V2
                  </h2>
                  <span className="text-[10px] text-white/25 ml-auto">New / updated version</span>
                </div>
                <div className="p-3">
                  <textarea
                    value={schemaV2}
                    onChange={(e) => setSchemaV2(e.target.value)}
                    placeholder={`CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255),\n  phone VARCHAR(20),\n  ...\n);`}
                    className="w-full h-64 bg-black/20 border border-white/[0.07] rounded-xl px-4 py-3 text-xs text-white/65 font-mono placeholder-white/15 outline-none focus:border-emerald-500/30 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Run button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={runDiff}
                disabled={state === "loading" || !schemaV1.trim() || !schemaV2.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0 text-white font-medium px-8 py-3 rounded-xl text-sm"
              >
                {state === "loading" ? (
                  <>
                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Comparing schemas...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="9" x2="15" y1="15" y2="15"/><line x1="12" x2="12" y1="12" y2="18"/></svg>
                    Compare with AI
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="bg-red-500/8 border border-red-500/2 rounded-xl px-5 py-4 flex items-center gap-3 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {state === "done" && result && (
          <div className="space-y-5">

            {/* Summary + stat row */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                <h2 className="text-sm font-semibold text-white/60" style={{ fontFamily: "'Syne', sans-serif" }}>Summary</h2>
              </div>
              <p className="text-sm text-white/65 leading-relaxed mb-4">{result.summary}</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Total changes", value: result.totalChanges, color: "text-white/70" },
                  { label: "Added",         value: result.added?.length ?? 0,    color: "text-emerald-400" },
                  { label: "Removed",       value: result.removed?.length ?? 0,  color: "text-red-400"     },
                  { label: "Modified",      value: result.modified?.length ?? 0, color: "text-amber-400"   },
                ].map((s) => (
                  <div key={s.label} className="bg-white/3 border border-white/[0.07] rounded-xl p-3 text-center">
                    <div className={`text-2xl font-bold mb-0.5 ${s.color}`} style={{ fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
                    <div className="text-[10px] text-white/30">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Breaking changes */}
            {result.breakingChanges?.length > 0 && (
              <div className="bg-red-500/6 border border-red-500/2 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-red-500/12">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                  <h2 className="text-sm font-semibold text-red-400/80" style={{ fontFamily: "'Syne', sans-serif" }}>Breaking Changes</h2>
                </div>
                <div className="p-4 space-y-2">
                  {result.breakingChanges.map((b, i) => (
                    <div key={i} className="flex gap-2.5 text-xs text-red-300/70 leading-relaxed">
                      <span className="text-red-400 shrink-0 mt-0.5">!</span>
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Changes grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Added */}
              <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/[0.07]">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h2 className="text-xs font-semibold text-white/55" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Added ({result.added?.length ?? 0})
                  </h2>
                </div>
                <div className="p-3 space-y-2">
                  {result.added?.length ? result.added.map((c, i) => (
                    <div key={i} className="bg-emerald-500/5 border border-emerald-500/12 rounded-lg p-2.5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[10px] text-emerald-400/80 leading-relaxed flex-1">{c.description}</span>
                        <span className={`text-[8px] font-medium border rounded-full px-1.5 py-0.5 shrink-0 ${IMPACT_STYLE[c.impact]}`}>{c.impact}</span>
                      </div>
                    </div>
                  )) : <p className="text-xs text-white/20 text-center py-3">Nothing added</p>}
                </div>
              </div>

              {/* Removed */}
              <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/[0.07]">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <h2 className="text-xs font-semibold text-white/55" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Removed ({result.removed?.length ?? 0})
                  </h2>
                </div>
                <div className="p-3 space-y-2">
                  {result.removed?.length ? result.removed.map((c, i) => (
                    <div key={i} className="bg-red-500/5 border border-red-500/12 rounded-lg p-2.5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[10px] text-red-400/80 leading-relaxed flex-1">{c.description}</span>
                        <span className={`text-[8px] font-medium border rounded-full px-1.5 py-0.5 shrink-0 ${IMPACT_STYLE[c.impact]}`}>{c.impact}</span>
                      </div>
                    </div>
                  )) : <p className="text-xs text-white/20 text-center py-3">Nothing removed</p>}
                </div>
              </div>

              {/* Modified */}
              <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/[0.07]">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <h2 className="text-xs font-semibold text-white/55" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Modified ({result.modified?.length ?? 0})
                  </h2>
                </div>
                <div className="p-3 space-y-2">
                  {result.modified?.length ? result.modified.map((c, i) => (
                    <div key={i} className="bg-amber-500/5 border border-amber-500/12 rounded-lg p-2.5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[10px] text-amber-400/80 leading-relaxed flex-1">{c.description}</span>
                        <span className={`text-[8px] font-medium border rounded-full px-1.5 py-0.5 shrink-0 ${IMPACT_STYLE[c.impact]}`}>{c.impact}</span>
                      </div>
                    </div>
                  )) : <p className="text-xs text-white/20 text-center py-3">Nothing modified</p>}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.07]">
                  <h2 className="text-sm font-semibold text-white/60" style={{ fontFamily: "'Syne', sans-serif" }}>Migration Recommendations</h2>
                </div>
                <div className="p-4 space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-2.5 text-xs text-white/50 leading-relaxed">
                      <span className="text-blue-400 mt-0.5 shrink-0">→</span>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Content;