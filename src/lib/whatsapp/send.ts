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

export async function sendDigestWhatsApp(
  input: WhatsAppSendInput,
): Promise<WhatsAppSendResult> {
  const primary =
    input.preferredLanguage === "hi" ? input.summaryHi : input.summaryEn;
  const secondary =
    input.preferredLanguage === "hi" ? input.summaryEn : input.summaryHi;

  const body = `Helis update for ${input.studentName}\n\n${primary}\n\n—\n${secondary}`;

  if (isWhatsAppMock()) {
    console.log("[Helis WhatsApp MOCK]", { to: input.to, body });
    return {
      success: true,
      mock: true,
      messageId: `mock-${Date.now()}`,
      log: `Mock WhatsApp sent to ${input.to}`,
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
        to: input.to.replace(/\D/g, ""),
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
    log: `WhatsApp sent to ${input.to}`,
  };
}
