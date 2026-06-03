"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FormInput from "@/components/reusable/input/FormInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterSchema } from "@/components/schema/schema";

const Register = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const getStrength = (pw: string) => {
    if (pw.length === 0) return 0;
    if (pw.length < 5) return 1;
    if (pw.length < 8) return 2;
    if (pw.length < 12) return 3;
    return 4;
  };

  const passwrd = watch("password") ?? "";
  const strength = getStrength(passwrd);

  const strengthColor = (index: number) => {
    if (index >= strength) return "bg-white/10";
    if (strength === 1) return "bg-red-500";
    if (strength === 2) return "bg-amber-400";
    return "bg-emerald-500";
  };

  async function onSubmit(data: RegisterSchema) {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed. Please try again.");
      }

      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`fixed inset-0 z-500 min-h-screen bg-[#070b14] flex items-center justify-center px-4 py-12 font-sans `}
    >
      <div className="relative z-999 w-full max-w-md">
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

        <div className="">
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
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
              Join CloudRift
            </div>
            {/* <CustomButton onClick={onClose}>X</CustomButton> */}

            <h1
              className="text-2xl font-extrabold text-[#f0f4fa] tracking-tight mb-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Create your account
            </h1>
            <p className="text-xs text-white/35 font-light mb-6">
              Already have one?{" "}
              <Link
                href="/auth/login"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {submitError && (
                <p className="text-sm text-red-400 text-center">{submitError}</p>
              )}
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  error={errors.first_name}
                  {...register("first_name")}
                  placeholder="John"
                  label="Firstname"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm text-[#e8edf5] placeholder-white/20 outline-none transition-colors ${errors.first_name ? "border-red-500" : "border border-white/10 focus:border-blue-500/50 focus:bg-white/6  "}`}
                  validation="required"
                />
                <FormInput
                  error={errors.last_name}
                  {...register("last_name")}
                  placeholder="John"
                  label="Lastname"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm text-[#e8edf5] placeholder-white/20 outline-none transition-colors ${errors.last_name ? "border-red-500" : "border border-white/10 focus:border-blue-500/50 focus:bg-white/6  "}`}
                  validation="required"
                />
              </div>
              {/* Email */}
              <FormInput
                error={errors.email}
                {...register("email")}
                placeholder="test@gmail.com"
                label="Email"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-[#e8edf5] placeholder-white/20 outline-none  transition-colors ${errors.email ? "border-red-500" : " border-white/10 focus:border-blue-500/50 focus:bg-white/6"}`}
                validation="required"
              />
              {/* Password */}
              <div>
                <FormInput
                  error={errors.password}
                  {...register("password")}
                  type="password"
                  placeholder="test@gmail.com"
                  label="Password"
                  className="w-full  border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#e8edf5] placeholder-white/20 outline-none focus:border-blue-500/50 focus:bg-white/6 transition-colors"
                  validation="required"
                />
                {/* Strength bars */}
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 h-0.75 rounded-full transition-colors duration-300 ${strengthColor(i)}`}
                    />
                  ))}
                </div>
              </div>
              {/* Confirm password */}
              <FormInput
                error={errors.confirm_password}
                {...register("confirm_password")}
                type="password"
                placeholder="test@gmail.com"
                label="Confirm Password"
                className={`w-full border  rounded-lg px-3 py-2.5 text-sm text-[#e8edf5] placeholder-white/20 outline-none transition-colors ${errors.confirm_password ? "border-red-500" : "border border-white/10 focus:border-blue-500/50 focus:bg-white/6 "}`}
                validation="required"
              />
              {/* <div className="w-full flex text-center">
                <Link
                  href="/"
                  className="w-full bg-blue-600 hover:bg-blue-500 transition-colors text-white font-medium text-sm py-3 rounded-xl mt-1"
                >
                  Create account
                </Link>
              </div> */}
              <div className="w-full flex text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 transition-colors text-white font-medium text-sm py-3 rounded-xl mt-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating account..." : "Submit"}
                </button>
              </div>
              {/* Submit */}

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-white/[0.07]" />
                <span className="text-[11px] text-white/25">or</span>
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

            {/* Terms */}
            <p className="text-[10px] text-white/20 text-center mt-5 leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-blue-400 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-400 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
