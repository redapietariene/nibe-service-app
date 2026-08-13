import Link from "next/link";

export default function Tasks() {
  return (
    <div className="w-full">
      <Link
        href="/"
        className="text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to home
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Tasks
      </h1>
    </div>
  );
}
