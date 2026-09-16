import { NextResponse } from "next/server";

import { demoStore } from "@/lib/demo-store";
import { scoreStudentRisk } from "@/lib/pulse/score";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const guardianId = searchParams.get("guardianId") ?? "guard-1";
  const studentId = searchParams.get("studentId");

  const children = demoStore.listChildrenForGuardian(guardianId);
  if (children.length === 0) {
    return NextResponse.json({ error: "No children linked" }, { status: 404 });
  }

  const student =
    (studentId ? demoStore.getStudent(studentId) : null) ?? children[0];

  if (!student || !children.some((c) => c.id === student.id)) {
    return NextResponse.json({ error: "Student not linked" }, { status: 403 });
  }

  const events = demoStore.listEventsForStudent(student.id);
  const risk = scoreStudentRisk(student, events);
  const digest = demoStore.getLatestDigest(student.id);
  const guardian = demoStore.getGuardian(guardianId);

  // Chart series: last 14 days attendance / concern / win counts
  const days = 14;
  const chart = Array.from({ length: days }, (_, i) => {
    const dayOffset = days - 1 - i;
    const start = dayOffset + 1;
    const end = dayOffset;
    const dayEvents = events.filter((e) => {
      const age =
        (Date.now() - new Date(e.occurredAt).getTime()) /
        (24 * 60 * 60 * 1000);
      return age < start && age >= end;
    });
    return {
      day: new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(5, 10),
      concerns: dayEvents.filter((e) => e.valence === "concern").length,
      wins: dayEvents.filter((e) => e.valence === "positive").length,
      attendance: dayEvents.filter((e) => e.type === "attendance").length,
    };
  });

  return NextResponse.json({
    guardian,
    children,
    student,
    events,
    risk,
    digest,
    chart,
  });
}
