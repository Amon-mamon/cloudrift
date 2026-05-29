"use client";

import FormInput from "@/components/reusable/input/FormInput";
import Link from "next/link";

const Login = () => {
  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center px-4 py-12 font-sans">
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute w-125 h-125 rounded-full opacity-20 blur-[90px] bg-blue-600 -top-32 -left-20" />
        <div className="absolute w-85 h-85 rounded-full opacity-15 blur-[80px] bg-emerald-600 top-10 -right-16" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(56,138,221,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,138,221,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span
            className="text-xl font-extrabold text-[#f0f4fa] tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            CloudRift
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#0f1623] border border-white/9 rounded-2xl p-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 text-[11px] text-blue-300 bg-blue-500/10 border border-blue-500/25 rounded-full px-3 py-1 mb-5">
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
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
            Welcome back
          </div>

          <h1
            className="text-2xl font-extrabold text-[#f0f4fa] tracking-tight mb-1"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Sign in to CloudRift
          </h1>
          <p className="text-xs text-white/35 font-light mb-6">
            No account yet?{" "}
            <Link
              href="/auth/register"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Create one free
            </Link>
          </p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col">
              {/* Email */}
              <div className="mt-2">
                <FormInput
                  placeholder="test@gmail.com"
                  label="Email"
                  className="w-full border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#e8edf5] placeholder-white/20 outline-none focus:border-blue-500/50 focus:bg-white/6 transition-colors"
                  validation="required"
                />
              </div>
              {/* Password */}
              <div className="mt-2">
                <FormInput
                  placeholder="test@gmail.com"
                  label="Password"
                  className="w-full border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#e8edf5] placeholder-white/20 outline-none focus:border-blue-500/50 focus:bg-white/6 transition-colors"
                  validation="required"
                />
              </div>
              <Link
                href="/forgot-password"
                className="text-[11px] text-right mt-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <div></div>

            {/* Submit */}
            <div className="w-full flex text-center">
              <Link
                href="/dashboard/"
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 transition-colors text-white font-medium text-sm py-3 rounded-xl"
              >
                Sign in
              </Link>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-[11px] text-white/25">or</span>c
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            {/* Google */}
            <button
              type="button"
              className="w-full bg-white/4 hover:bg-white/[0.07] border border-white/10 rounded-xl py-2.5 text-xs text-white/55 hover:text-white/75 transition-all flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Security badge */}
          <div className="mt-6 bg-blue-500/[0.07] border border-blue-500/18 rounded-xl p-3.5 flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#378ADD"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 mt-0.5"
            >
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <div>
              <div className="text-[11px] font-medium text-blue-300/90 mb-0.5">
                Secured with 256-bit encryption
              </div>
              <div className="text-[10px] text-white/28 leading-relaxed">
                Your files and data are always private and protected.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
