import { NextResponse } from "next/server";
import { resendConfirmationSchema } from "@/components/schema/schema";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid confirmation request." },
      { status: 400 }
    );
  }

  const parsed = resendConfirmationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid email address",
        details: parsed.error.format(),
      },
      { status: 400 }
    );
  }

  let supabase;

  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json(
      { error: "Server configuration required for Supabase confirmation." },
      { status: 500 }
    );
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
  });

  if (error) {
    const status =
      "status" in error && typeof error.status === "number" ? error.status : 400;
    const isRateLimited =
      status === 429 || error.message.toLowerCase().includes("rate limit");

    return NextResponse.json(
      {
        error: isRateLimited
          ? "Email rate limit exceeded. Please wait before requesting another confirmation email."
          : error.message,
        code: isRateLimited ? "email_rate_limit_exceeded" : undefined,
      },
      { status: isRateLimited ? 429 : status }
    );
  }

  return NextResponse.json({
    message: "Confirmation email sent. Check your inbox.",
  });
}
