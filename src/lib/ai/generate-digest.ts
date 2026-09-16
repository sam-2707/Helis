import OpenAI from "openai";
import { z } from "zod";

import {
  buildDigestUserPrompt,
  DIGEST_SYSTEM_PROMPT,
  templateDigest,
} from "@/lib/ai/prompts";
import { isOpenAIConfigured } from "@/lib/config";
import type { DigestDraft, Student, StudentEvent } from "@/lib/types";

const digestSchema = z.object({
  summary_en: z.string(),
  summary_hi: z.string(),
  highlights: z.array(z.string()),
  suggested_home_actions: z.array(z.string()),
  risk_note: z.string().optional(),
});

export async function generateDigestDraft(
  student: Student,
  events: StudentEvent[],
  periodStart: string,
  periodEnd: string,
): Promise<DigestDraft> {
  if (!isOpenAIConfigured()) {
    return templateDigest(student, events);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: DIGEST_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildDigestUserPrompt(
            student,
            events,
            periodStart,
            periodEnd,
          ),
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return templateDigest(student, events);
    }

    return digestSchema.parse(JSON.parse(content));
  } catch {
    return templateDigest(student, events);
  }
}
