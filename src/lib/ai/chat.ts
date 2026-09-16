import OpenAI from "openai";
import { z } from "zod";

import {
  buildParentChatPrompt,
  PARENT_CHAT_SYSTEM,
  TEACHER_REPLY_SYSTEM,
  templateParentChatAnswer,
  templateTeacherReply,
} from "@/lib/ai/chat-prompts";
import { isOpenAIConfigured } from "@/lib/config";
import type {
  Digest,
  PreferredLanguage,
  Student,
  StudentEvent,
} from "@/lib/types";

const chatSchema = z.object({
  answer: z.string(),
  cited_dates: z.array(z.string()).default([]),
  refused: z.boolean().default(false),
  refuse_reason: z.string().optional(),
});

export async function answerParentChat(input: {
  student: Student;
  language: PreferredLanguage;
  question: string;
  events: StudentEvent[];
  digest?: Digest | null;
}) {
  if (!isOpenAIConfigured()) {
    return templateParentChatAnswer(input);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: PARENT_CHAT_SYSTEM },
        { role: "user", content: buildParentChatPrompt(input) },
      ],
    });
    const content = response.choices[0]?.message?.content;
    if (!content) return templateParentChatAnswer(input);
    return chatSchema.parse(JSON.parse(content));
  } catch {
    return templateParentChatAnswer(input);
  }
}

export async function draftTeacherReply(input: {
  parentMessage: string;
  studentName: string;
  events: StudentEvent[];
}) {
  if (!isOpenAIConfigured()) {
    return { draft: templateTeacherReply(input) };
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const eventLines = input.events
    .slice(0, 8)
    .map(
      (e) =>
        `- ${e.occurredAt.slice(0, 10)} | ${e.type} | ${e.valence} | ${e.body}`,
    )
    .join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: TEACHER_REPLY_SYSTEM },
        {
          role: "user",
          content: `Student: ${input.studentName}\nParent message: ${input.parentMessage}\nEvents:\n${eventLines || "(none)"}\n\nWrite only the reply draft text.`,
        },
      ],
    });
    const draft =
      response.choices[0]?.message?.content?.trim() ||
      templateTeacherReply(input);
    return { draft };
  } catch {
    return { draft: templateTeacherReply(input) };
  }
}
