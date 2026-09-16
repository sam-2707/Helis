import { NextResponse } from "next/server";
import { z } from "zod";

import { generateDigestDraft } from "@/lib/ai/generate-digest";
import { demoStore } from "@/lib/demo-store";

const bodySchema = z.object({
  studentId: z.string(),
  periodDays: z.number().min(1).max(30).default(7),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const student = demoStore.getStudent(parsed.data.studentId);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - parsed.data.periodDays);

  const events = demoStore
    .listEventsForStudent(student.id)
    .filter(
      (event) =>
        new Date(event.occurredAt) >= periodStart &&
        new Date(event.occurredAt) <= periodEnd,
    );

  const draft = await generateDigestDraft(
    student,
    events,
    periodStart.toISOString().slice(0, 10),
    periodEnd.toISOString().slice(0, 10),
  );

  const digest = demoStore.saveDigest({
    studentId: student.id,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    summaryEn: draft.summary_en,
    summaryHi: draft.summary_hi,
    highlights: draft.highlights,
    suggestedHomeActions: draft.suggested_home_actions,
    status: "draft",
    deliveryChannel: "whatsapp",
  });

  return NextResponse.json({ digest, draft, eventCount: events.length });
}
