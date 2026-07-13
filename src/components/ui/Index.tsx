import Link from "next/link";

const LegacyIndex = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 text-center">
      <div className="max-w-xl space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Legacy dashboard removed</h1>
        <p className="text-gray-600">
          The ZenU experience now lives entirely in the Next.js App Router pages. Visit the home page to explore the
          real-time integrations powered by Supabase and Gemini.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-white shadow-lg transition hover:shadow-xl"
      >
        Go to ZenU home
      </Link>
    </div>
  );
};

export default LegacyIndex;
