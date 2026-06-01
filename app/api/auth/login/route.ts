import { NextResponse } from "next/server";
import { loginSchema } from "@/components/schema/schema";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid login request." },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid login data",
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
      { error: "Server configuration required for Supabase login." },
      { status: 500 }
    );
  }

  const { email, password } = parsed.data;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const code =
      "code" in error && typeof error.code === "string" ? error.code : undefined;
    const isEmailNotConfirmed =
      code === "email_not_confirmed" ||
      error.message.toLowerCase().includes("email not confirmed");

    return NextResponse.json(
      {
        error: error.message,
        code: isEmailNotConfirmed ? "email_not_confirmed" : code,
      },
      { status: isEmailNotConfirmed ? 403 : 401 }
    );
  }

  if (!data.session?.access_token || !data.session.refresh_token) {
    return NextResponse.json(
      { error: "Unable to start login session." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Login successful.",
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
    user: {
      id: data.user?.id,
      email: data.user?.email,
    },
  });
}
