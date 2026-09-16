import type {
  Digest,
  PreferredLanguage,
  Student,
  StudentEvent,
} from "@/lib/types";

export const PARENT_CHAT_SYSTEM = `You are Helis parent chat for one child only.
Answer ONLY from the provided events and digests. If unknown, say so and suggest asking the teacher.
Never invent grades, medical/legal advice, or compare to other students.
Respond in the parent's preferred language.`;

export const TEACHER_REPLY_SYSTEM = `You draft warm, specific teacher replies to parents.
Use only the parent message and recent events. Never invent incidents.
Keep it brief, actionable, and professional.`;

export function buildParentChatPrompt(input: {
  student: Student;
  language: PreferredLanguage;
  question: string;
  events: StudentEvent[];
  digest?: Digest | null;
}) {
  const facts = input.events
    .map(
      (e) =>
        `- ${e.occurredAt.slice(0, 10)} | ${e.type} | ${e.valence} | ${e.body}`,
    )
    .join("\n");

  const digestBlock = input.digest
    ? `Latest approved digest (EN): ${input.digest.summaryEn}\nLatest approved digest (HI): ${input.digest.summaryHi}`
    : "No approved digest yet.";

  return `Child: ${input.student.name}
Parent language: ${input.language}
Question: ${input.question}

Known events:
${facts || "(none)"}

${digestBlock}

Return JSON: { "answer": string, "cited_dates": string[], "refused": boolean, "refuse_reason"?: string }`;
}

export function templateParentChatAnswer(input: {
  language: PreferredLanguage;
  question: string;
  events: StudentEvent[];
}): {
  answer: string;
  cited_dates: string[];
  refused: boolean;
  refuse_reason?: string;
} {
  const q = input.question.toLowerCase();
  const outOfScope =
    q.includes("other student") ||
    q.includes("diagnose") ||
    q.includes("medicine") ||
    q.includes("lawsuit");

  if (outOfScope) {
    return {
      answer:
        input.language === "hi"
          ? "मैं इस सवाल का जवाब नहीं दे सकता। कृपया शिक्षक से सीधे बात करें।"
          : "I can't answer that from classroom records. Please ask the teacher directly.",
      cited_dates: [],
      refused: true,
      refuse_reason: "Out of scope or unsafe to answer from events alone.",
    };
  }

  if (input.events.length === 0) {
    return {
      answer:
        input.language === "hi"
          ? "इस बच्चे के लिए अभी कोई कक्षा अपडेट दर्ज नहीं है। शिक्षक से पूछें।"
          : "No classroom updates are logged yet for this child. Please ask the teacher.",
      cited_dates: [],
      refused: true,
      refuse_reason: "No events available.",
    };
  }

  const homework = input.events.filter((e) => e.tags.includes("homework"));
  const wins = input.events.filter((e) => e.valence === "positive");
  const concerns = input.events.filter((e) => e.valence === "concern");

  let answerEn = "";
  if (q.includes("homework") && homework.length) {
    answerEn = `From class records: ${homework.map((e) => `${e.occurredAt.slice(0, 10)} — ${e.body}`).join(" ")}`;
  } else if ((q.includes("good") || q.includes("win") || q.includes("positive")) && wins.length) {
    answerEn = `Recent positives: ${wins.map((e) => `${e.occurredAt.slice(0, 10)} — ${e.body}`).join(" ")}`;
  } else if (concerns.length && (q.includes("how") || q.includes("week") || q.includes("doing"))) {
    answerEn = `This period includes ${concerns.length} concern signal(s) and ${wins.length} positive(s). Latest: ${input.events[0].body} (${input.events[0].occurredAt.slice(0, 10)}).`;
  } else {
    answerEn = `Based on logged signals, the latest update is: ${input.events[0].body} (${input.events[0].occurredAt.slice(0, 10)}). Ask the teacher for anything not covered here.`;
  }

  const answerHi = `कक्षा रिकॉर्ड के अनुसार: ${input.events[0].body} (${input.events[0].occurredAt.slice(0, 10)}). अधिक जानकारी के लिए शिक्षक से संपर्क करें।`;

  return {
    answer: input.language === "hi" ? answerHi : answerEn,
    cited_dates: input.events.slice(0, 3).map((e) => e.occurredAt.slice(0, 10)),
    refused: false,
  };
}

export function templateTeacherReply(input: {
  parentMessage: string;
  studentName: string;
  events: StudentEvent[];
}) {
  const latest = input.events[0];
  const concern = input.events.find((e) => e.valence === "concern");
  const win = input.events.find((e) => e.valence === "positive");

  let draft = `Thank you for reaching out about ${input.studentName}. `;
  if (latest) {
    draft += `From recent class notes (${latest.occurredAt.slice(0, 10)}): ${latest.body} `;
  }
  if (concern) {
    draft += `One area we're watching is: ${concern.body} `;
  }
  if (win) {
    draft += `On a positive note: ${win.body} `;
  }
  draft +=
    "Happy to discuss further — a short call this week would help if you'd like.";

  return draft.trim();
}
