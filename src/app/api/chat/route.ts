import { NextResponse } from "next/server";
import { z } from "zod";

import { answerParentChat, draftTeacherReply } from "@/lib/ai/chat";
import { demoStore } from "@/lib/demo-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const conversationId = searchParams.get("conversationId");
  const classId = searchParams.get("classId");

  if (classId) {
    const convs = demoStore.listConversationsByClass(classId).map((c) => {
      const msgs = demoStore.listMessages(c.id);
      const student = demoStore.getStudent(c.studentId);
      const guardian = demoStore.getGuardian(c.guardianId);
      return {
        conversation: c,
        student,
        guardian,
        lastMessage: msgs[msgs.length - 1] ?? null,
        unreadFromParent:
          msgs.length > 0 && msgs[msgs.length - 1].sender === "parent",
      };
    });
    return NextResponse.json({ conversations: convs });
  }

  if (conversationId) {
    const conversation = demoStore.getConversation(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      conversation,
      messages: demoStore.listMessages(conversationId),
      student: demoStore.getStudent(conversation.studentId),
      guardian: demoStore.getGuardian(conversation.guardianId),
    });
  }

  if (studentId) {
    const conversation = demoStore.getOrCreateConversation(studentId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Could not open conversation" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      conversation,
      messages: demoStore.listMessages(conversation.id),
      student: demoStore.getStudent(studentId),
      guardian: demoStore.getGuardian(conversation.guardianId),
    });
  }

  return NextResponse.json(
    { error: "studentId, conversationId, or classId required" },
    { status: 400 },
  );
}

const sendSchema = z.object({
  conversationId: z.string(),
  sender: z.enum(["parent", "teacher"]),
  body: z.string().min(1),
});

const askSchema = z.object({
  action: z.literal("ask_ai"),
  studentId: z.string(),
  question: z.string().min(1),
});

const draftSchema = z.object({
  action: z.literal("draft_reply"),
  conversationId: z.string(),
  parentMessageId: z.string(),
});

export async function POST(request: Request) {
  const json = await request.json();

  if (json.action === "ask_ai") {
    const parsed = askSchema.safeParse(json);
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
    const guardian = demoStore.getGuardianForStudent(student.id);
    const conversation = demoStore.getOrCreateConversation(student.id);
    if (!conversation || !guardian) {
      return NextResponse.json(
        { error: "Conversation unavailable" },
        { status: 404 },
      );
    }

    demoStore.addMessage({
      conversationId: conversation.id,
      sender: "parent",
      body: parsed.data.question,
    });

    const events = demoStore.listEventsForStudent(student.id);
    const digest = demoStore.getLatestDigest(student.id);
    const result = await answerParentChat({
      student,
      language: guardian.preferredLanguage,
      question: parsed.data.question,
      events,
      digest:
        digest && (digest.status === "approved" || digest.status === "sent")
          ? digest
          : null,
    });

    const aiMessage = demoStore.addMessage({
      conversationId: conversation.id,
      sender: "ai",
      body: result.answer,
    });

    return NextResponse.json({
      conversation,
      messages: demoStore.listMessages(conversation.id),
      result,
      aiMessage,
    });
  }

  if (json.action === "draft_reply") {
    const parsed = draftSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const conversation = demoStore.getConversation(parsed.data.conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const msgs = demoStore.listMessages(conversation.id);
    const parentMsg = msgs.find((m) => m.id === parsed.data.parentMessageId);
    if (!parentMsg) {
      return NextResponse.json(
        { error: "Parent message not found" },
        { status: 404 },
      );
    }
    const student = demoStore.getStudent(conversation.studentId)!;
    const events = demoStore.listEventsForStudent(student.id);
    const { draft } = await draftTeacherReply({
      parentMessage: parentMsg.body,
      studentName: student.name,
      events,
    });
    demoStore.setMessageAiDraft(parentMsg.id, draft);
    return NextResponse.json({ draft, messageId: parentMsg.id });
  }

  const parsed = sendSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const message = demoStore.addMessage(parsed.data);
  return NextResponse.json({ message }, { status: 201 });
}
