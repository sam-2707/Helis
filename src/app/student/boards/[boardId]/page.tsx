import Link from "next/link";
import { notFound } from "next/navigation";

import { KanbanBoardView } from "@/components/kanban-board";
import { demoStore } from "@/lib/demo-store";

interface PageProps {
  params: Promise<{ boardId: string }>;
  searchParams: Promise<{ as?: string }>;
}

export default async function StudentBoardPage({
  params,
  searchParams,
}: PageProps) {
  const { boardId } = await params;
  const { as } = await searchParams;
  const board = demoStore.getBoard(boardId);
  if (!board) notFound();

  const student = as ? demoStore.getStudent(as) : undefined;
  const members = demoStore.listMembersByGroup(board.groupId);
  const allowed = !as || members.some((m) => m.studentId === as);

  if (!allowed) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <h1 className="text-2xl text-[var(--ink)]">Access denied</h1>
        <p className="mt-2 text-[var(--muted)]">
          Students only see their own group board.
        </p>
        <Link href="/" className="mt-4 inline-block text-[var(--accent)]">
          Home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
        Helis · Student
      </p>
      <h1 className="mt-2 text-3xl text-[var(--ink)]">
        {student ? `${student.name}'s group board` : "Group board"}
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Drag cards between columns. Moving to Done logs a classroom signal.
      </p>
      <div className="mt-8">
        <KanbanBoardView boardId={boardId} />
      </div>
    </main>
  );
}
