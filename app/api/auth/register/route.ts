import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase";
import { registerSchema } from "@/components/schema/schema";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid registration data",
        details: parsed.error.format(),
      },
      { status: 400 }
    );
  }

  const { first_name, last_name, email, password } = parsed.data;

  let supabase;

  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json(
      { error: "Server configuration required for Supabase registration." },
      { status: 500 }
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
      },
    },
  });

  if (error) {
    const status =
      "status" in error && typeof error.status === "number" ? error.status : 400;
    const isRateLimited =
      status === 429 || error.message.toLowerCase().includes("rate limit");

    return NextResponse.json(
      {
        error: isRateLimited
          ? "Email rate limit exceeded. Please wait before creating another account or requesting another email."
          : error.message,
        code: isRateLimited ? "email_rate_limit_exceeded" : undefined,
      },
      { status: isRateLimited ? 429 : status }
    );
  }

  if (!data.user?.id) {
    return NextResponse.json(
      { error: "Unable to create user account." },
      { status: 500 }
    );
  }

  try {
    await prisma.user.create({
      data: {
        id: data.user.id,
        email,
        firstName: first_name,
        lastName: last_name,
        provider: "supabase",
      },
    });
  } catch (error) {
    console.error("Prisma create user failed", error);
    return NextResponse.json(
      { error: "Unable to save user profile." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Registration successful. Check your email to confirm if required.",
    },
    { status: 201 }
  );
}
