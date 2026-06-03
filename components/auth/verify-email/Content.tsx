"use client";

import { useSearchParams } from "next/navigation";

const Content = () =>  {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">
          Check your email
        </h1>

        <p className="mb-6">
          We've sent a verification link to:
        </p>

        <p className="font-semibold mb-6">
          {email}
        </p>
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Open Gmail
        </a>
      </div>
    </div>
  );
}

export default Content;