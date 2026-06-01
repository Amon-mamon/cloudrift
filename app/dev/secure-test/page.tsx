import CallSecureExample from "@/components/auth/CallSecureExample";

export default function Page() {
  return (
    <div className="min-h-screen flex items-start justify-center pt-20">
      <div className="w-full max-w-3xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Dev: Secure Endpoint Test</h2>
        <CallSecureExample />
      </div>
    </div>
  );
}
