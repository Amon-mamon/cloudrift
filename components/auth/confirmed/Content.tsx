"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Content = () => {
 const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div>
      Email verified. Redirecting to login...
    </div>
  );
}

export default Content;