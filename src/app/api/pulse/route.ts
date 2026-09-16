import { NextResponse } from "next/server";

import { demoStore } from "@/lib/demo-store";
import { scoreClassPulse } from "@/lib/pulse/score";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");

  if (!classId) {
    return NextResponse.json({ error: "classId required" }, { status: 400 });
  }

  const students = demoStore.listStudentsByClass(classId);
  const events = demoStore.listEventsForClass(classId);
  const pulse = scoreClassPulse(students, events);

  return NextResponse.json({
    pulse,
    students: Object.fromEntries(students.map((s) => [s.id, s])),
  });
}
