"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useEffect, useState } from "react";

import type {
  KanbanBoard,
  KanbanCard,
  KanbanColumn,
  Project,
  ProjectGroup,
  Student,
} from "@/lib/types";

function SortableCard({
  card,
  studentName,
}: {
  card: KanbanCard;
  studentName?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: card.id });
  const overdue =
    card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm active:cursor-grabbing"
    >
      <p className="text-sm font-medium text-[var(--ink)]">{card.title}</p>
      {card.body ? (
        <p className="mt-1 text-xs text-[var(--muted)]">{card.body}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-[var(--muted)]">
        {studentName ? <span>{studentName}</span> : null}
        {overdue ? (
          <span className="rounded bg-rose-100 px-1 text-rose-800">overdue</span>
        ) : null}
      </div>
    </div>
  );
}

function Column({
  column,
  cards,
  students,
}: {
  column: KanbanColumn;
  cards: KanbanCard[];
  students: Record<string, Student>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[200px] flex-1 rounded-xl border p-3 ${
        isOver ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--paper)]"
      }`}
    >
      <h3 className="mb-3 text-sm font-semibold text-[var(--ink)]">
        {column.name}
        <span className="ml-2 text-[var(--muted)]">{cards.length}</span>
      </h3>
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              studentName={
                card.assigneeId
                  ? students[card.assigneeId]?.name
                  : undefined
              }
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

interface KanbanBoardViewProps {
  boardId: string;
  canAdd?: boolean;
}

export function KanbanBoardView({ boardId, canAdd = true }: KanbanBoardViewProps) {
  const [board, setBoard] = useState<KanbanBoard | null>(null);
  const [group, setGroup] = useState<ProjectGroup | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [newTitle, setNewTitle] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const load = useCallback(async () => {
    const res = await fetch(`/api/kanban?boardId=${boardId}`);
    const data = await res.json();
    setBoard(data.board);
    setGroup(data.group);
    setProject(data.project);
    setColumns(data.columns ?? []);
    setCards(data.cards ?? []);
    setStudents(data.students ?? {});
  }, [boardId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const cardId = String(active.id);
    let toColumnId = String(over.id);

    // Dropped on another card → use that card's column
    const overCard = cards.find((c) => c.id === toColumnId);
    if (overCard) toColumnId = overCard.columnId;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.columnId === toColumnId) return;

    // Optimistic
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, columnId: toColumnId } : c)),
    );

    const res = await fetch("/api/kanban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "move", cardId, toColumnId }),
    });
    if (!res.ok) {
      setStatus("Move failed — reloading");
      await load();
    } else {
      setStatus("Moved — event emitted for digest/Pulse if Done or overdue");
      await load();
    }
  }

  async function addCard(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !columns[0]) return;
    await fetch("/api/kanban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add",
        boardId,
        columnId: columns[0].id,
        title: newTitle.trim(),
        body: "",
      }),
    });
    setNewTitle("");
    await load();
  }

  if (!board) {
    return <p className="text-sm text-[var(--muted)]">Loading board…</p>;
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-[var(--accent)]">
          {project?.title} · {group?.name}
        </p>
        <h2 className="text-2xl text-[var(--ink)]">Kanban board</h2>
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={cards.filter((c) => c.columnId === column.id)}
              students={students}
            />
          ))}
        </div>
      </DndContext>

      {canAdd ? (
        <form onSubmit={addCard} className="mt-4 flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a task card"
            className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-white"
          >
            Add
          </button>
        </form>
      ) : null}

      {status ? (
        <p className="mt-2 text-sm text-[var(--muted)]">{status}</p>
      ) : null}
    </div>
  );
}
