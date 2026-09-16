import Link from "next/link";
import { notFound } from "next/navigation";

import { demoStore } from "@/lib/demo-store";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectOverviewPage({ params }: PageProps) {
  const { projectId } = await params;
  const project = demoStore.getProject(projectId);
  if (!project) notFound();

  const groups = demoStore.listGroupsByProject(projectId);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <Link
        href={`/teacher/class/${project.classId}`}
        className="text-sm text-[var(--accent)] hover:underline"
      >
        ← Back to class
      </Link>
      <header className="mb-8 mt-4">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
          Helis · All groups
        </p>
        <h1 className="mt-2 text-4xl text-[var(--ink)]">{project.title}</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          {project.description} · Due {project.dueDate.slice(0, 10)}
        </p>
      </header>

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        {groups.map((group) => {
          const board = demoStore.getBoardByGroup(group.id);
          const members = demoStore.listMembersByGroup(group.id);
          const cards = board ? demoStore.listCardsByBoard(board.id) : [];
          const columns = board ? demoStore.listColumnsByBoard(board.id) : [];
          const doneCol = columns.find((c) => c.name === "Done");
          const overdue = cards.filter(
            (c) =>
              c.dueDate &&
              new Date(c.dueDate) < new Date() &&
              c.columnId !== doneCol?.id,
          ).length;
          return (
            <Link
              key={group.id}
              href={board ? `/teacher/boards/${board.id}` : "#"}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--accent)]"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-xl text-[var(--ink)]">{group.name}</h2>
                {overdue > 0 ? (
                  <span className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-800">
                    {overdue} overdue
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800">
                    on track
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {members
                  .map((m) => demoStore.getStudent(m.studentId)?.name)
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p className="mt-3 text-xs text-[var(--muted)]">
                {cards.length} cards · open board →
              </p>
            </Link>
          );
        })}
      </div>

      <p className="mb-4 text-sm text-[var(--muted)]">
        Student demo links (own group only):
      </p>
      <ul className="mb-10 flex flex-wrap gap-2">
        {demoStore.listStudentsByClass(project.classId).map((student) => {
          const group = demoStore.getGroupForStudent(projectId, student.id);
          const board = group
            ? demoStore.getBoardByGroup(group.id)
            : undefined;
          if (!board) return null;
          return (
            <li key={student.id}>
              <Link
                href={`/student/boards/${board.id}?as=${student.id}`}
                className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs"
              >
                {student.name.split(" ")[0]} → {group?.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
