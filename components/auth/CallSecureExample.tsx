"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";

export default function CallSecureExample() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function callApi() {
      setLoading(true);
      try {
        const res = await authFetch("/api/secure-example");
        const json = await res.json();
        if (!mounted) return;
        setData(json);
      } catch (err) {
        if (!mounted) return;
        setData({ error: String(err) });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    callApi();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading secure example...</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h3>Secure example response</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
