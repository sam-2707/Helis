import { NextResponse } from "next/server";
import { z } from "zod";

import { demoStore } from "@/lib/demo-store";

const createSchema = z.object({
  classId: z.string(),
  title: z.string().min(1),
  description: z.string().default(""),
  dueDate: z.string(),
  groupCount: z.number().min(1).max(10).default(2),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");
  const projectId = searchParams.get("projectId");

  if (projectId) {
    const project = demoStore.getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const groups = demoStore.listGroupsByProject(projectId).map((group) => {
      const board = demoStore.getBoardByGroup(group.id);
      const members = demoStore.listMembersByGroup(group.id);
      const cards = board ? demoStore.listCardsByBoard(board.id) : [];
      const columns = board ? demoStore.listColumnsByBoard(board.id) : [];
      const overdue = cards.filter(
        (c) =>
          c.dueDate &&
          new Date(c.dueDate) < new Date() &&
          columns.find((col) => col.id === c.columnId)?.name !== "Done",
      ).length;
      return {
        group,
        board,
        members,
        cardCount: cards.length,
        overdue,
      };
    });
    return NextResponse.json({ project, groups });
  }

  if (!classId) {
    return NextResponse.json(
      { error: "classId or projectId required" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    projects: demoStore.listProjectsByClass(classId),
  });
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const project = demoStore.createProject(parsed.data);
  return NextResponse.json({ project }, { status: 201 });
}
