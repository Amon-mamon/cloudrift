import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) return null;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return null;

  return data.user;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

export async function withAuthenticatedUser(
  request: Request,
  handler: (authUser: any) => Promise<Response>
) {
  const authUser = await getAuthenticatedUser(request);
  if (!authUser) return unauthorizedResponse();
  return handler(authUser);
}
