import { NextResponse } from "next/server";
import { z } from "zod";

import { demoStore } from "@/lib/demo-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get("boardId");
  const groupId = searchParams.get("groupId");

  const board = boardId
    ? demoStore.getBoard(boardId)
    : groupId
      ? demoStore.getBoardByGroup(groupId)
      : undefined;

  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const group = demoStore.getGroup(board.groupId);
  const project = demoStore.getProject(board.projectId);
  const columns = demoStore.listColumnsByBoard(board.id);
  const cards = demoStore.listCardsByBoard(board.id);
  const members = demoStore.listMembersByGroup(board.groupId);
  const students = Object.fromEntries(
    members
      .map((m) => demoStore.getStudent(m.studentId))
      .filter(Boolean)
      .map((s) => [s!.id, s!]),
  );

  return NextResponse.json({
    board,
    group,
    project,
    columns,
    cards,
    members,
    students,
  });
}

const moveSchema = z.object({
  cardId: z.string(),
  toColumnId: z.string(),
});

const addSchema = z.object({
  boardId: z.string(),
  columnId: z.string(),
  title: z.string().min(1),
  body: z.string().default(""),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json();
  const action = json.action as string | undefined;

  if (action === "move") {
    const parsed = moveSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const card = demoStore.moveCard(parsed.data.cardId, parsed.data.toColumnId);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    return NextResponse.json({ card });
  }

  if (action === "add") {
    const parsed = addSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const card = demoStore.addCard(parsed.data);
    return NextResponse.json({ card }, { status: 201 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
