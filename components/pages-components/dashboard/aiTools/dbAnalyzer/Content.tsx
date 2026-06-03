"use client";

import { useState, useRef } from "react";

type AnalysisState = "idle" | "loading" | "done" | "error";

interface AnalysisResult {
  summary: string;
  tables: { name: string; columns: number; description: string }[];
  relationships: string[];
  issues: string[];
  recommendations: string[];
  engine: string;
}

const SAMPLE_FILES = [
  { name: "ecommerce_schema_v4.sql", engine: "PostgreSQL" },
  { name: "users_schema.sql", engine: "MySQL" },
  { name: "inventory_schema.sql", engine: "MySQL" },
  { name: "app_local.sqlite", engine: "SQLite" },
];

const ENGINE_STYLE: Record<string, string> = {
  PostgreSQL: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  MySQL: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  SQLite: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
};

const Content = () => {
  const [state, setState] = useState<AnalysisState>("idle");
  const [selectedFile, setSelected] = useState<string | null>(null);
  const [pastedSQL, setPastedSQL] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "paste">("file");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploaded] = useState<{
    name: string;
    content: string;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploaded({ name: file.name, content: ev.target?.result as string });
      setSelected(null);
    };
    reader.readAsText(file);
  };

  const analyze = async () => {
    const content =
      inputMode === "paste"
        ? pastedSQL
        : uploadedFile
          ? uploadedFile.content
          : selectedFile
            ? `-- Sample schema: ${selectedFile}\nCREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, name VARCHAR(100), created_at TIMESTAMP DEFAULT NOW());\nCREATE TABLE orders (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), total DECIMAL(10,2), status VARCHAR(50), created_at TIMESTAMP DEFAULT NOW());\nCREATE TABLE products (id SERIAL PRIMARY KEY, name VARCHAR(255), price DECIMAL(10,2), stock INT DEFAULT 0);\nCREATE TABLE order_items (id SERIAL PRIMARY KEY, order_id INT REFERENCES orders(id), product_id INT REFERENCES products(id), quantity INT, price DECIMAL(10,2));`
            : "";

    if (!content.trim()) return;

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
          messages: [
            {
              role: "user",
              content: `You are a database expert. Analyze this SQL schema and return ONLY a JSON object with no markdown, no backticks, no extra text. The JSON must have these exact keys:
{
  "summary": "2-3 sentence plain English overview of this database",
  "engine": "detected DB engine (PostgreSQL/MySQL/SQLite/Unknown)",
  "tables": [{ "name": "table_name", "columns": 5, "description": "what this table stores" }],
  "relationships": ["plain English description of each foreign key relationship"],
  "issues": ["any potential problems like missing indexes, nullable PKs, etc"],
  "recommendations": ["concrete improvement suggestions"]
}

Schema to analyze:
${content.slice(0, 3000)}`,
            },
          ],
        }),
      });

      const data = await response.json();
      const text =
        data.content
          ?.map((c: { type: string; text?: string }) =>
            c.type === "text" ? c.text : "",
          )
          .join("") ?? "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed: AnalysisResult = JSON.parse(clean);
      setResult(parsed);
      setState("done");
    } catch {
      setError(
        "Failed to analyze schema. Please check your input and try again.",
      );
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setResult(null);
    setError("");
    setSelected(null);
    setUploaded(null);
    setPastedSQL("");
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-[#e8edf5] font-sans">
      {/* Background */}
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
            <div className="inline-flex items-center gap-1.5 text-[11px] text-blue-300 bg-blue-500/10 border border-blue-500/25 rounded-full px-3 py-1 mb-3">
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
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
              AI Tools · DB Analyzer
            </div>
            <h1
              className="text-3xl font-extrabold text-[#f0f4fa] tracking-[-1px] mb-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              DB Analyzer
            </h1>
            <p className="text-sm text-white/40 font-light">
              Upload a schema file and AI will break it down in plain English
            </p>
          </div>
          {state === "done" && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 bg-white/3 hover:bg-white/6 border border-white/10 text-white/50 hover:text-white/75 text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
            >
              ← Analyze another
            </button>
          )}
        </div>

        {state !== "done" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Input mode toggle */}
            <div className="lg:col-span-2 flex items-center bg-white/3 border border-white/8 rounded-xl p-1 gap-1 w-fit">
              {(["file", "paste"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setInputMode(m)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${inputMode === m ? "bg-blue-500/15 text-blue-300 border border-blue-500/2" : "text-white/35 hover:text-white/60"}`}
                >
                  {m === "file" ? "Pick from Drive" : "Paste SQL"}
                </button>
              ))}
            </div>

            {inputMode === "file" ? (
              <>
                {/* Drive files */}
                <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                  <div className="px-4 py-3.5 border-b border-white/[0.07]">
                    <h2
                      className="text-sm font-semibold text-white/55"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      From My Drive
                    </h2>
                    <p className="text-[11px] text-white/25 mt-0.5">
                      Select a schema file from your projects
                    </p>
                  </div>
                  <div className="p-2 space-y-1">
                    {SAMPLE_FILES.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => {
                          setSelected(f.name);
                          setUploaded(null);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${selectedFile === f.name ? "bg-blue-500/12 border border-blue-500/2" : "hover:bg-white/4 border border-transparent"}`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-[9px] font-bold shrink-0">
                          SQL
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white/70 truncate group-hover:text-white/90">
                            {f.name}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-medium border rounded-full px-1.5 py-0.5 shrink-0 ${ENGINE_STYLE[f.engine]}`}
                        >
                          {f.engine}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload */}
                <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                  <div className="px-4 py-3.5 border-b border-white/[0.07]">
                    <h2
                      className="text-sm font-semibold text-white/55"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      Upload a File
                    </h2>
                    <p className="text-[11px] text-white/25 mt-0.5">
                      Supports .sql .db .sqlite .dump
                    </p>
                  </div>
                  <div className="p-4">
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".sql,.db,.sqlite,.dump,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      className={`w-full border border-dashed rounded-xl p-6 flex flex-col items-center gap-2 transition-all group ${uploadedFile ? "border-blue-500/40 bg-blue-500/4" : "border-white/10 hover:border-blue-500/35 hover:bg-blue-500/4"}`}
                    >
                      {uploadedFile ? (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#60a5fa"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <div className="text-sm font-medium text-blue-300">
                            {uploadedFile.name}
                          </div>
                          <div className="text-[11px] text-white/30">
                            File ready for analysis
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-white/4 group-hover:bg-blue-500/10 border border-white/8 group-hover:border-blue-500/25 flex items-center justify-center transition-all">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="17"
                              height="17"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-white/25 group-hover:text-blue-400 transition-colors"
                            >
                              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                              <path d="M12 12v9" />
                              <path d="m16 16-4-4-4 4" />
                            </svg>
                          </div>
                          <div className="text-sm text-white/35 group-hover:text-white/55 transition-colors">
                            Drop your schema file here
                          </div>
                          <div className="text-[11px] text-white/20">
                            or click to browse
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="lg:col-span-2 bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                <div className="px-4 py-3.5 border-b border-white/[0.07]">
                  <h2
                    className="text-sm font-semibold text-white/55"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Paste your SQL
                  </h2>
                  <p className="text-[11px] text-white/25 mt-0.5">
                    Paste CREATE TABLE statements or any SQL schema
                  </p>
                </div>
                <div className="p-4">
                  <textarea
                    value={pastedSQL}
                    onChange={(e) => setPastedSQL(e.target.value)}
                    placeholder={`CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  ...\n);`}
                    className="w-full h-52 bg-black/20 border border-white/[0.07] rounded-xl px-4 py-3 text-xs text-white/65 font-mono placeholder-white/15 outline-none focus:border-blue-500/40 transition-colors resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analyze button */}
        {state !== "done" && (
          <div className="flex justify-center mb-8">
            <button
              onClick={analyze}
              disabled={
                state === "loading" ||
                (!selectedFile && !uploadedFile && !pastedSQL.trim())
              }
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0 text-white font-medium px-8 py-3 rounded-xl text-sm"
            >
              {state === "loading" ? (
                <>
                  <svg
                    className="animate-spin"
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
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Analyzing schema...
                </>
              ) : (
                <>
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
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  </svg>
                  Analyze with AI
                </>
              )}
            </button>
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="bg-red-500/8 border border-red-500/2 rounded-xl px-5 py-4 flex items-center gap-3 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E24B4A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {state === "done" && result && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
                <h2
                  className="text-sm font-semibold text-white/60"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Summary
                </h2>
                {result.engine && (
                  <span
                    className={`text-[9px] font-medium border rounded-full px-2 py-0.5 ml-auto ${ENGINE_STYLE[result.engine] ?? "bg-white/10 text-white/40 border-white/20"}`}
                  >
                    {result.engine}
                  </span>
                )}
              </div>
              <p className="text-sm text-white/65 leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Tables */}
            <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.07]">
                <h2
                  className="text-sm font-semibold text-white/60"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Tables ({result.tables?.length ?? 0})
                </h2>
              </div>
              <div className="divide-y divide-white/5">
                {result.tables?.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-white/2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
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
                        <path d="M3 3h18v18H3z" />
                        <path d="M3 9h18" />
                        <path d="M3 15h18" />
                        <path d="M9 3v18" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white/75 font-mono">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-white/35 mt-0.5">
                        {t.description}
                      </div>
                    </div>
                    <div className="text-[10px] text-white/25 shrink-0">
                      {t.columns} cols
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Relationships + Issues grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.07]">
                  <h2
                    className="text-sm font-semibold text-white/60"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Relationships
                  </h2>
                </div>
                <div className="p-4 space-y-2">
                  {result.relationships?.length ? (
                    result.relationships.map((r, i) => (
                      <div
                        key={i}
                        className="flex gap-2.5 text-xs text-white/50 leading-relaxed"
                      >
                        <span className="text-violet-400 mt-0.5 shrink-0">
                          →
                        </span>
                        {r}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/25">
                      No relationships detected
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.07]">
                  <h2
                    className="text-sm font-semibold text-white/60"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Potential Issues
                  </h2>
                </div>
                <div className="p-4 space-y-2">
                  {result.issues?.length ? (
                    result.issues.map((issue, i) => (
                      <div
                        key={i}
                        className="flex gap-2.5 text-xs text-white/50 leading-relaxed"
                      >
                        <span className="text-amber-400 mt-0.5 shrink-0">
                          ⚠
                        </span>
                        {issue}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-emerald-400/60">
                      No issues detected 🎉
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.07]">
                <h2
                  className="text-sm font-semibold text-white/60"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  AI Recommendations
                </h2>
              </div>
              <div className="p-4 space-y-2">
                {result.recommendations?.map((rec, i) => (
                  <div
                    key={i}
                    className="flex gap-2.5 text-xs text-white/50 leading-relaxed"
                  >
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;
