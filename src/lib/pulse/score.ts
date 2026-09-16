import type { RiskSignal, Student, StudentEvent } from "@/lib/types";

const WINDOW_DAYS = 14;

function daysAgo(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000);
}

/** Deterministic early-warning score from recent StudentEvents (not LLM). */
export function scoreStudentRisk(
  student: Student,
  events: StudentEvent[],
  windowDays = WINDOW_DAYS,
): RiskSignal {
  const recent = events.filter((event) => daysAgo(event.occurredAt) <= windowDays);

  let score = 0;
  const reasons: string[] = [];

  const concerns = recent.filter((e) => e.valence === "concern");
  const positives = recent.filter((e) => e.valence === "positive");
  const attendanceConcerns = concerns.filter(
    (e) => e.type === "attendance" || e.tags.includes("late") || e.tags.includes("absent"),
  );
  const homeworkConcerns = concerns.filter((e) => e.tags.includes("homework"));

  for (const event of concerns) {
    score += event.severity * 8;
  }

  if (attendanceConcerns.length >= 2) {
    score += 15;
    reasons.push(`${attendanceConcerns.length} attendance/late signals in ${windowDays}d`);
  }

  if (homeworkConcerns.length >= 1) {
    score += 10;
    reasons.push("Homework concern logged");
  }

  if (concerns.length >= 2) {
    reasons.push(`${concerns.length} concern signals`);
  }

  if (positives.length === 0 && recent.length >= 3) {
    score += 8;
    reasons.push("No wins logged despite recent activity");
  }

  // Soften with positives
  score = Math.max(0, score - positives.length * 4);

  if (reasons.length === 0) {
    reasons.push("No elevated patterns in this window");
  }

  const level =
    score >= 40 ? "elevated" : score >= 18 ? "watch" : "low";

  // Sparkline: last 7 day buckets of concern weight minus positive
  const sparkline: number[] = [];
  for (let d = 6; d >= 0; d--) {
    const dayStart = d + 1;
    const dayEnd = d;
    const dayEvents = recent.filter((e) => {
      const age = daysAgo(e.occurredAt);
      return age < dayStart && age >= dayEnd;
    });
    const dayScore = dayEvents.reduce((acc, e) => {
      if (e.valence === "concern") return acc + e.severity;
      if (e.valence === "positive") return acc - 1;
      return acc;
    }, 0);
    sparkline.push(dayScore);
  }

  return {
    studentId: student.id,
    score,
    level,
    reasons,
    windowDays,
    positiveCount: positives.length,
    concernCount: concerns.length,
    attendanceConcerns: attendanceConcerns.length,
    sparkline,
  };
}

export function scoreClassPulse(students: Student[], events: StudentEvent[]) {
  return students
    .map((student) =>
      scoreStudentRisk(
        student,
        events.filter((e) => e.studentId === student.id),
      ),
    )
    .sort((a, b) => b.score - a.score);
}
