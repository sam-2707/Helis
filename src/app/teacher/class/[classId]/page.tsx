import Link from "next/link";
import { notFound } from "next/navigation";

import { ClassWorkspace } from "@/components/class-workspace";
import { demoStore } from "@/lib/demo-store";

interface ClassPageProps {
  params: Promise<{ classId: string }>;
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { classId } = await params;
  const classRoom = demoStore.getClass(classId);

  if (!classRoom) {
    notFound();
  }

  const students = demoStore.listStudentsByClass(classId);
  const initialEvents = demoStore.listEventsForClass(classId);
  const consentByStudent = Object.fromEntries(
    students.map((student) => [
      student.id,
      demoStore.hasConsentForStudent(student.id),
    ]),
  );

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <Link
        href="/teacher"
        className="text-sm text-[var(--accent)] hover:underline"
      >
        ← All classes
      </Link>
      <header className="mb-8 mt-4">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
          Helis · Class
        </p>
        <h1 className="mt-2 text-4xl text-[var(--ink)]">{classRoom.name}</h1>
        <p className="mt-2 text-[var(--muted)]">
          Log events, generate bilingual digests, send WhatsApp (mock until
          credentials are configured).
        </p>
      </header>

      <ClassWorkspace
        classRoom={classRoom}
        students={students}
        consentByStudent={consentByStudent}
        initialEvents={initialEvents}
      />
    </main>
  );
}
