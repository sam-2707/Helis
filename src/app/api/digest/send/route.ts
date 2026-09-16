import { NextResponse } from "next/server";
import { z } from "zod";

import { demoStore } from "@/lib/demo-store";
import { sendDigestWhatsApp } from "@/lib/whatsapp/send";

const bodySchema = z.object({
  digestId: z.string(),
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

  const target = demoStore.getDigestById(parsed.data.digestId);

  if (!target) {
    return NextResponse.json({ error: "Digest not found" }, { status: 404 });
  }

  if (target.status !== "approved") {
    return NextResponse.json(
      { error: "Digest must be approved before sending" },
      { status: 400 },
    );
  }

  const student = demoStore.getStudent(target.studentId);
  const guardian = demoStore.getGuardianForStudent(target.studentId);

  if (!student || !guardian) {
    return NextResponse.json(
      { error: "Student or guardian not found" },
      { status: 404 },
    );
  }

  if (!demoStore.hasConsentForStudent(student.id)) {
    return NextResponse.json(
      {
        error: "ConsentRecord required before WhatsApp send",
        code: "CONSENT_REQUIRED",
      },
      { status: 403 },
    );
  }

  const result = await sendDigestWhatsApp({
    to: guardian.phone,
    studentName: student.name,
    summaryEn: target.summaryEn,
    summaryHi: target.summaryHi,
    preferredLanguage: guardian.preferredLanguage,
  });

  const updated = demoStore.updateDigest(target.id, {
    status: result.success ? "sent" : "failed",
    sentAt: result.success ? new Date().toISOString() : undefined,
    deliveryLog: result.log,
  });

  return NextResponse.json({ digest: updated, delivery: result });
}
