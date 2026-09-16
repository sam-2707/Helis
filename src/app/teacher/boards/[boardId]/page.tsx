import Link from "next/link";
import { notFound } from "next/navigation";

import { KanbanBoardView } from "@/components/kanban-board";
import { demoStore } from "@/lib/demo-store";

interface PageProps {
  params: Promise<{ boardId: string }>;
}

export default async function TeacherBoardPage({ params }: PageProps) {
  const { boardId } = await params;
  const board = demoStore.getBoard(boardId);
  if (!board) notFound();

  const project = demoStore.getProject(board.projectId);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <Link
        href={`/teacher/projects/${board.projectId}`}
        className="text-sm text-[var(--accent)] hover:underline"
      >
        ← All groups
      </Link>
      <div className="mt-6">
        <KanbanBoardView boardId={boardId} />
      </div>
      {project ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Class:{" "}
          <Link
            href={`/teacher/class/${project.classId}`}
            className="text-[var(--accent)] hover:underline"
          >
            open class home
          </Link>
        </p>
      ) : null}
    </main>
  );
}
