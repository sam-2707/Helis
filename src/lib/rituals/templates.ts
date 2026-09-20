import type { EventType, EventValence } from "@/lib/types";

export interface RitualTemplate {
  id: string;
  label: string;
  labelHi: string;
  type: EventType;
  valence: EventValence;
  severity: 1 | 2 | 3;
  tags: string[];
  /** Use {student} placeholder */
  bodyEn: string;
  bodyHi: string;
  /** Send WhatsApp to parent on tap */
  notifyParent: boolean;
  /** Accent for chip UI */
  tone: "concern" | "win" | "neutral" | "attendance";
}

export const RITUAL_TEMPLATES: RitualTemplate[] = [
  {
    id: "homework_missing",
    label: "Homework missing",
    labelHi: "गृहकार्य नहीं",
    type: "academic",
    valence: "concern",
    severity: 2,
    tags: ["homework"],
    bodyEn: "{student} did not submit homework today.",
    bodyHi: "{student} ने आज गृहकार्य जमा नहीं किया।",
    notifyParent: true,
    tone: "concern",
  },
  {
    id: "late",
    label: "Late",
    labelHi: "देर से आए",
    type: "attendance",
    valence: "concern",
    severity: 1,
    tags: ["late"],
    bodyEn: "{student} arrived late to class.",
    bodyHi: "{student} कक्षा में देर से आए।",
    notifyParent: true,
    tone: "attendance",
  },
  {
    id: "volunteer",
    label: "Volunteered",
    labelHi: "स्वयंसेवा",
    type: "win",
    valence: "positive",
    severity: 1,
    tags: ["volunteer", "participation"],
    bodyEn: "{student} volunteered in class today.",
    bodyHi: "{student} ने आज कक्षा में स्वयंसेवा की।",
    notifyParent: true,
    tone: "win",
  },
  {
    id: "good_work",
    label: "Good work",
    labelHi: "अच्छा काम",
    type: "win",
    valence: "positive",
    severity: 1,
    tags: ["praise"],
    bodyEn: "{student} did strong work in class today.",
    bodyHi: "{student} ने आज कक्षा में अच्छा काम किया।",
    notifyParent: true,
    tone: "win",
  },
  {
    id: "needs_focus",
    label: "Needs focus",
    labelHi: "ध्यान चाहिए",
    type: "behavior",
    valence: "concern",
    severity: 1,
    tags: ["focus"],
    bodyEn: "{student} needed reminders to stay focused today.",
    bodyHi: "{student} को आज ध्यान केंद्रित रखने के लिए याद दिलाना पड़ा।",
    notifyParent: false,
    tone: "concern",
  },
  {
    id: "present",
    label: "Present / OK",
    labelHi: "ठीक है",
    type: "note",
    valence: "neutral",
    severity: 1,
    tags: ["check"],
    bodyEn: "{student} — homework check OK.",
    bodyHi: "{student} — गृहकार्य जाँच ठीक।",
    notifyParent: false,
    tone: "neutral",
  },
];

export function fillTemplate(
  template: string,
  studentName: string,
): string {
  return template.replaceAll("{student}", studentName);
}

export function getTemplate(id: string) {
  return RITUAL_TEMPLATES.find((t) => t.id === id);
}
