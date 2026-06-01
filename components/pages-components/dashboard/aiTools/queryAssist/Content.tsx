"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SAMPLE_SCHEMAS = [
  { name: "ecommerce_schema_v4.sql", engine: "PostgreSQL", schema: `CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, name VARCHAR(100), created_at TIMESTAMP DEFAULT NOW());\nCREATE TABLE products (id SERIAL PRIMARY KEY, name VARCHAR(255), price DECIMAL(10,2), stock INT DEFAULT 0, category_id INT);\nCREATE TABLE orders (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), total DECIMAL(10,2), status VARCHAR(50), created_at TIMESTAMP DEFAULT NOW());\nCREATE TABLE order_items (id SERIAL PRIMARY KEY, order_id INT REFERENCES orders(id), product_id INT REFERENCES products(id), quantity INT, price DECIMAL(10,2));\nCREATE TABLE categories (id SERIAL PRIMARY KEY, name VARCHAR(100), parent_id INT);` },
  { name: "users_schema.sql",         engine: "MySQL",      schema: `CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255), role ENUM('admin','user','guest') DEFAULT 'user', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);\nCREATE TABLE sessions (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT REFERENCES users(id), token VARCHAR(512), expires_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);\nCREATE TABLE roles (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50), permissions JSON);` },
];

const STARTER_PROMPTS = [
  "Get all users who placed an order in the last 30 days",
  "Find the top 5 best-selling products",
  "Show total revenue grouped by month",
  "Get all orders with their items and product names",
  "Find users who never placed an order",
];

const ENGINE_STYLE: Record<string, string> = {
  PostgreSQL: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  MySQL:      "bg-amber-500/10 text-amber-300 border-amber-500/20",
  SQLite:     "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
};

const Content = () => {
  const [selectedSchema, setSchema] = useState(SAMPLE_SCHEMAS[0]);
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [copied, setCopied]         = useState<number | null>(null);
  const bottomRef                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userText = text ?? input.trim();
    if (!userText || loading) return;
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an expert SQL query assistant. The user is working with this database schema (${selectedSchema.engine}):\n\n${selectedSchema.schema}\n\nWhen asked to write a query, provide:\n1. The SQL query in a code block\n2. A brief plain-English explanation of what it does\n3. Any important notes about performance or edge cases\n\nAlways write queries compatible with ${selectedSchema.engine}. Be concise and practical.`,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.map((c: { type: string; text?: string }) => c.type === "text" ? c.text : "").join("") ?? "Sorry, I couldn't generate a response.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (text: string, i: number) => {
    const match = text.match(/```[\w]*\n([\s\S]*?)```/);
    navigator.clipboard.writeText(match ? match[1] : text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  const renderMessage = (msg: Message, i: number) => {
    const parts = msg.content.split(/(```[\w]*\n[\s\S]*?```)/g);
    return (
      <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
        {msg.role === "assistant" && (
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </div>
        )}
        <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
          {parts.map((part, pi) => {
            if (part.startsWith("```")) {
              const code = part.replace(/```[\w]*\n/, "").replace(/```$/, "");
              return (
                <div key={pi} className="relative group w-full">
                  <pre className="bg-black/30 border border-white/8 rounded-xl px-4 py-3.5 text-xs text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap">{code}</pre>
                  <button
                    onClick={() => copyCode(msg.content, i)}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md bg-white/8 hover:bg-white/15 text-white/35 hover:text-white/65 transition-all opacity-0 group-hover:opacity-100"
                  >
                    {copied === i
                      ? <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    }
                  </button>
                </div>
              );
            }
            if (!part.trim()) return null;
            return (
              <div key={pi} className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white/4 border border-white/[0.07] text-white/70 rounded-bl-sm"
              }`}>
                {part}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-[#e8edf5] font-sans">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute w-125 h-125 rounded-full opacity-20 blur-[90px] bg-blue-600" style={{ top: "-120px", left: "140px" }} />
        <div className="absolute w-90 h-90 rounded-full opacity-15 blur-[80px] bg-emerald-600" style={{ top: "60px", right: "-60px" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(56,138,221,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56,138,221,0.05) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      <div className="relative z-10 p-8 w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-blue-300 bg-blue-500/10 border border-blue-500/25 rounded-full px-3 py-1 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            AI Tools · Query Assistant
          </div>
          <h1 className="text-3xl font-extrabold text-[#f0f4fa] tracking-[-1px] mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Query Assistant</h1>
          <p className="text-sm text-white/40 font-light">Select a schema and ask AI to write SQL queries for you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
          {/* Left — schema picker */}
          <div className="space-y-4">
            <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-white/[0.07]">
                <h2 className="text-xs font-semibold text-white/50" style={{ fontFamily: "'Syne', sans-serif" }}>Active Schema</h2>
              </div>
              <div className="p-2 space-y-1">
                {SAMPLE_SCHEMAS.map((s) => (
                  <button key={s.name}
                    onClick={() => { setSchema(s); setMessages([]); }}
                    className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all group ${selectedSchema.name === s.name ? "bg-blue-500/12 border border-blue-500/2" : "hover:bg-white/4 border border-transparent"}`}>
                    <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">SQL</div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-white/65 truncate">{s.name}</div>
                      <span className={`text-[9px] font-medium border rounded-full px-1.5 py-0.5 ${ENGINE_STYLE[s.engine]}`}>{s.engine}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Schema preview */}
            <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.07]">
                <h2 className="text-xs font-semibold text-white/50" style={{ fontFamily: "'Syne', sans-serif" }}>Schema Preview</h2>
              </div>
              <pre className="p-3 text-[10px] text-white/30 font-mono overflow-auto max-h-48 leading-relaxed whitespace-pre-wrap">
                {selectedSchema.schema}
              </pre>
            </div>
          </div>

          {/* Right — chat */}
          <div className="flex flex-col bg-white/3 border border-white/8 rounded-xl overflow-hidden" style={{ minHeight: "600px" }}>
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 9 5 12 1.774-5.226L21 14 9 9z"/><path d="m16.071 16.071 4.243 4.243"/></svg>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-white/55 mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Ask anything about your schema</div>
                    <div className="text-xs text-white/25">I'll write the SQL query for you</div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                    {STARTER_PROMPTS.map((p) => (
                      <button key={p} onClick={() => sendMessage(p)}
                        className="text-left text-xs text-white/40 hover:text-white/65 bg-white/3 hover:bg-white/6 border border-white/[0.07] rounded-xl px-3.5 py-2.5 transition-all">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => renderMessage(msg, i))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                      </div>
                      <div className="bg-white/4 border border-white/[0.07] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                        {[0, 1, 2].map((d) => (
                          <div key={d} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/[0.07] p-4">
              <div className="flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Ask me to write a query... (Enter to send, Shift+Enter for newline)"
                  rows={2}
                  className="flex-1 bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#e8edf5] placeholder-white/20 outline-none focus:border-blue-500/50 transition-colors resize-none"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Content;