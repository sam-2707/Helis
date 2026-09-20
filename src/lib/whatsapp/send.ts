import { isWhatsAppMock } from "@/lib/config";

export interface WhatsAppSendInput {
  to: string;
  studentName: string;
  summaryEn: string;
  summaryHi: string;
  preferredLanguage: "en" | "hi";
}

export interface WhatsAppSendResult {
  success: boolean;
  mock: boolean;
  messageId?: string;
  log: string;
}

export interface RitualWhatsAppInput {
  to: string;
  studentName: string;
  bodyEn: string;
  bodyHi: string;
  preferredLanguage: "en" | "hi";
}

function buildBilingualBody(
  preferredLanguage: "en" | "hi",
  studentName: string,
  primary: string,
  secondary: string,
) {
  return `Helis · ${studentName}\n\n${preferredLanguage === "hi" ? primary : secondary}\n\n—\n${preferredLanguage === "hi" ? secondary : primary}`;
}

async function dispatchWhatsApp(
  to: string,
  body: string,
): Promise<WhatsAppSendResult> {
  if (isWhatsAppMock()) {
    console.log("[Helis WhatsApp MOCK]", { to, body });
    return {
      success: true,
      mock: true,
      messageId: `mock-${Date.now()}`,
      log: `Mock WhatsApp sent to ${to}`,
    };
  }

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""),
        type: "text",
        text: { body },
      }),
    },
  );

  const payload = (await response.json()) as {
    messages?: Array<{ id: string }>;
    error?: { message: string };
  };

  if (!response.ok) {
    return {
      success: false,
      mock: false,
      log: payload.error?.message ?? "WhatsApp API error",
    };
  }

  return {
    success: true,
    mock: false,
    messageId: payload.messages?.[0]?.id,
    log: `WhatsApp sent to ${to}`,
  };
}

export async function sendDigestWhatsApp(
  input: WhatsAppSendInput,
): Promise<WhatsAppSendResult> {
  const body = buildBilingualBody(
    input.preferredLanguage,
    input.studentName,
    input.summaryHi,
    input.summaryEn,
  );
  return dispatchWhatsApp(input.to, body);
}

/** Short one-tap ritual message (homework miss, volunteer, etc.) */
export async function sendRitualWhatsApp(
  input: RitualWhatsAppInput,
): Promise<WhatsAppSendResult> {
  const body = buildBilingualBody(
    input.preferredLanguage,
    input.studentName,
    input.bodyHi,
    input.bodyEn,
  );
  return dispatchWhatsApp(input.to, body);
}
