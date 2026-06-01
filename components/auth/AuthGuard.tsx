"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        router.replace("/auth/login");
        return;
      }
      setReady(true);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/auth/login");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white/45 flex items-center justify-center text-sm">
        Loading your workspace...
      </div>
    );
  }

  return <>{children}</>;
}
