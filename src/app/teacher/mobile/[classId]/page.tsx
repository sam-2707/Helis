import Link from "next/link";
import { notFound } from "next/navigation";

import { MobileRitual } from "@/components/mobile-ritual";
import { demoStore } from "@/lib/demo-store";

interface PageProps {
  params: Promise<{ classId: string }>;
}

export default async function TeacherMobileClassPage({ params }: PageProps) {
  const { classId } = await params;
  const classRoom = demoStore.getClass(classId);
  if (!classRoom) notFound();

  const students = demoStore.listStudentsByClass(classId);
  const consentByStudent = Object.fromEntries(
    students.map((s) => [s.id, demoStore.hasConsentForStudent(s.id)]),
  );

  return (
    <main className="min-h-[100dvh] bg-[var(--paper)]">
      <div className="mx-auto max-w-lg px-4 pt-3">
        <Link
          href="/teacher/mobile"
          className="text-sm text-[var(--accent)]"
        >
          ← Classes
        </Link>
      </div>
      <MobileRitual
        classRoom={{ id: classRoom.id, name: classRoom.name }}
        students={students}
        consentByStudent={consentByStudent}
      />
    </main>
  );
}
