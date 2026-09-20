import Link from "next/link";

import { demoStore } from "@/lib/demo-store";

export default function TeacherMobileHome() {
  const classes = demoStore.listClasses();

  return (
    <main className="mx-auto min-h-[100dvh] max-w-lg px-4 py-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
        Helis · Teacher phone
      </p>
      <h1 className="mt-2 text-3xl text-[var(--ink)]">Pick a class</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Install this page on your phone home screen for mid-class taps.
      </p>

      <ul className="mt-8 space-y-3">
        {classes.map((c) => (
          <li key={c.id}>
            <Link
              href={`/teacher/mobile/${c.id}`}
              className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-5 text-lg font-medium active:scale-[0.99]"
            >
              {c.name}
              <span className="mt-1 block text-sm font-normal text-[var(--muted)]">
                {demoStore.listStudentsByClass(c.id).length} students
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/teacher"
        className="mt-8 inline-block text-sm text-[var(--accent)]"
      >
        ← Desktop teacher view
      </Link>
    </main>
  );
}
