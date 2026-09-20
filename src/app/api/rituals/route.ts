import { NextResponse } from "next/server";
import { z } from "zod";

import { demoStore } from "@/lib/demo-store";
import {
  fillTemplate,
  getTemplate,
  RITUAL_TEMPLATES,
} from "@/lib/rituals/templates";
import { sendRitualWhatsApp } from "@/lib/whatsapp/send";

export async function GET() {
  return NextResponse.json({ templates: RITUAL_TEMPLATES });
}

const tapSchema = z.object({
  action: z.literal("tap"),
  classId: z.string(),
  studentId: z.string(),
  templateId: z.string(),
  /** Queue WhatsApp until end of period if true (default false = send now when notified) */
  deferNotify: z.boolean().optional(),
});

const classEventSchema = z.object({
  action: z.literal("class_event"),
  classId: z.string(),
  title: z.string().min(1),
  description: z.string().default(""),
  durationMinutes: z.number().min(1).max(480).default(40),
  /** Students who get a win/volunteer tag; others get neutral participation note */
  volunteerIds: z.array(z.string()).default([]),
});

async function notifyParentForStudent(
  studentId: string,
  bodyEn: string,
  bodyHi: string,
) {
  const student = demoStore.getStudent(studentId);
  const guardian = demoStore.getGuardianForStudent(studentId);
  if (!student || !guardian) {
    return { sent: false, reason: "No guardian" as const };
  }
  if (!demoStore.hasConsentForStudent(studentId)) {
    return { sent: false, reason: "CONSENT_REQUIRED" as const };
  }

  const result = await sendRitualWhatsApp({
    to: guardian.phone,
    studentName: student.name,
    bodyEn,
    bodyHi,
    preferredLanguage: guardian.preferredLanguage,
  });

  return {
    sent: result.success,
    mock: result.mock,
    log: result.log,
    reason: result.success ? undefined : result.log,
  };
}

export async function POST(request: Request) {
  const json = await request.json();

  if (json.action === "class_event") {
    const parsed = classEventSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const students = demoStore.listStudentsByClass(parsed.data.classId);
    const volunteerSet = new Set(parsed.data.volunteerIds);
    const events = students.map((student) => {
      const isVolunteer = volunteerSet.has(student.id);
      return demoStore.addEvent({
        studentId: student.id,
        classId: parsed.data.classId,
        type: isVolunteer ? "win" : "note",
        valence: isVolunteer ? "positive" : "neutral",
        severity: 1,
        tags: isVolunteer
          ? ["class_event", "volunteer"]
          : ["class_event", "participation"],
        body: isVolunteer
          ? `${student.name} volunteered during "${parsed.data.title}" (${parsed.data.durationMinutes} min). ${parsed.data.description}`.trim()
          : `Class event "${parsed.data.title}" (${parsed.data.durationMinutes} min). ${parsed.data.description}`.trim(),
      });
    });

    const notifyResults = [];
    for (const student of students.filter((s) => volunteerSet.has(s.id))) {
      const bodyEn = `${student.name} volunteered during "${parsed.data.title}".`;
      const bodyHi = `${student.name} ने "${parsed.data.title}" में स्वयंसेवा की।`;
      notifyResults.push({
        studentId: student.id,
        ...(await notifyParentForStudent(student.id, bodyEn, bodyHi)),
      });
    }

    return NextResponse.json(
      {
        eventCount: events.length,
        events,
        notifications: notifyResults,
      },
      { status: 201 },
    );
  }

  const parsed = tapSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const template = getTemplate(parsed.data.templateId);
  if (!template) {
    return NextResponse.json({ error: "Unknown template" }, { status: 404 });
  }

  const student = demoStore.getStudent(parsed.data.studentId);
  if (!student || student.classId !== parsed.data.classId) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const bodyEn = fillTemplate(template.bodyEn, student.name);
  const bodyHi = fillTemplate(template.bodyHi, student.name);

  const event = demoStore.addEvent({
    studentId: student.id,
    classId: parsed.data.classId,
    type: template.type,
    valence: template.valence,
    severity: template.severity,
    tags: [...template.tags, "ritual", template.id],
    body: bodyEn,
  });

  let notification: {
    sent: boolean;
    reason?: string;
    mock?: boolean;
    log?: string;
  } | null = null;

  if (template.notifyParent && !parsed.data.deferNotify) {
    notification = await notifyParentForStudent(student.id, bodyEn, bodyHi);
  } else if (template.notifyParent && parsed.data.deferNotify) {
    notification = {
      sent: false,
      reason: "DEFERRED",
    };
  }

  return NextResponse.json(
    {
      event,
      template: { id: template.id, label: template.label },
      notification,
      preview: { bodyEn, bodyHi },
    },
    { status: 201 },
  );
}
