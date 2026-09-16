import { NextResponse } from "next/server";
import { z } from "zod";

import { demoStore } from "@/lib/demo-store";

const createEventSchema = z.object({
  studentId: z.string(),
  classId: z.string(),
  type: z.enum([
    "attendance",
    "academic",
    "behavior",
    "social",
    "win",
    "note",
  ]),
  valence: z.enum(["positive", "neutral", "concern"]),
  severity: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  tags: z.array(z.string()).default([]),
  body: z.string().min(1).max(280),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");
  const studentId = searchParams.get("studentId");

  if (studentId) {
    return NextResponse.json({
      events: demoStore.listEventsForStudent(studentId),
    });
  }

  if (classId) {
    return NextResponse.json({
      events: demoStore.listEventsForClass(classId),
    });
  }

  return NextResponse.json({ error: "classId or studentId required" }, { status: 400 });
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = createEventSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const event = demoStore.addEvent(parsed.data);
  return NextResponse.json({ event }, { status: 201 });
}
