import type { DigestDraft, Student, StudentEvent } from "@/lib/types";

export const DIGEST_SYSTEM_PROMPT = `You are Helis, a school communication assistant for Indian K-12 classrooms.
Write bilingual parent digests that are warm, specific, and actionable.
Never invent grades, incidents, or comparisons to other students.
Use only the events provided. If data is thin, say so briefly.`;

export function buildDigestUserPrompt(
  student: Student,
  events: StudentEvent[],
  periodStart: string,
  periodEnd: string,
) {
  const eventLines = events
    .map(
      (event) =>
        `- ${event.occurredAt.slice(0, 10)} | ${event.type} | ${event.valence} | ${event.body}`,
    )
    .join("\n");

  return `Student: ${student.name} (Grade ${student.grade})
Period: ${periodStart} to ${periodEnd}
Preferred parent language: ${student.preferredLanguage}

Events:
${eventLines || "(none)"}

Return JSON with keys:
summary_en, summary_hi, highlights (array), suggested_home_actions (array), risk_note (optional string).`;
}

export function templateDigest(
  student: Student,
  events: StudentEvent[],
): DigestDraft {
  const concerns = events.filter((event) => event.valence === "concern");
  const wins = events.filter((event) => event.valence === "positive");

  const summaryEn =
    events.length === 0
      ? `${student.name} had a quiet week with no new classroom signals logged.`
      : `${student.name} had ${events.length} classroom update(s) this period.` +
        (wins.length
          ? ` Highlights include ${wins[0].body.toLowerCase()}.`
          : "") +
        (concerns.length
          ? ` One area to watch: ${concerns[0].body.toLowerCase()}.`
          : "");

  const summaryHi =
    events.length === 0
      ? `${student.name} के लिए इस सप्ताह कोई नया अपडेट दर्ज नहीं हुआ।`
      : `${student.name} के लिए इस अवधि में ${events.length} कक्षा अपडेट दर्ज हुए।` +
        (wins.length ? ` अच्छी बात: ${wins[0].body}` : "") +
        (concerns.length ? ` ध्यान देने योग्य: ${concerns[0].body}` : "");

  return {
    summary_en: summaryEn,
    summary_hi: summaryHi,
    highlights: events.slice(0, 3).map((event) => event.body),
    suggested_home_actions:
      concerns.length > 0
        ? [
            "Ask about homework routine for 10 minutes tonight.",
            "Celebrate one small win from class this week.",
          ]
        : ["Ask your child to share one thing they enjoyed in class today."],
    risk_note:
      concerns.length >= 2
        ? "Multiple concern signals this period — a quick check-in may help."
        : undefined,
  };
}
