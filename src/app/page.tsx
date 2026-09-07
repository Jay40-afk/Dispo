import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4 text-center">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dispo</h1>
        <p className="mt-2 max-w-md text-slate-600">
          A dead-simple lead tracker and deal analyzer for wholesale real
          estate investors.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
