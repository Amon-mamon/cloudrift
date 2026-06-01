import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabasePublicKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

if (!supabaseUrl || !supabasePublicKey) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }
}

export const supabase = createClient(supabaseUrl, supabasePublicKey);

export const createServerSupabaseClient = () => {
  const supabaseServerKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabasePublicKey;

  if (!supabaseUrl || !supabaseServerKey) {
    throw new Error(
      "Missing Supabase server configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return createClient(supabaseUrl, supabaseServerKey, {
    auth: { persistSession: false },
  });
};