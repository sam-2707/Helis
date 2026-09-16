import Link from "next/link";

import { demoStore } from "@/lib/demo-store";

export default function TeacherHomePage() {
  const school = demoStore.getSchool();
  const classes = demoStore.listClasses();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
          Helis · Teacher
        </p>
        <h1 className="mt-2 text-4xl text-[var(--ink)]">{school.name}</h1>
        <p className="mt-2 text-[var(--muted)]">
          Pick a class to log signals and send bilingual WhatsApp digests.
        </p>
      </header>

      <div className="grid gap-4">
        {classes.map((classRoom) => {
          const students = demoStore.listStudentsByClass(classRoom.id);
          return (
            <Link
              key={classRoom.id}
              href={`/teacher/class/${classRoom.id}`}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--accent)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl text-[var(--ink)]">{classRoom.name}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {students.length} students · demo mode
                  </p>
                </div>
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm text-[var(--accent)]">
                  Open
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
