export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function isWhatsAppMock() {
  return (
    process.env.WHATSAPP_MOCK === "true" ||
    !process.env.WHATSAPP_TOKEN ||
    !process.env.WHATSAPP_PHONE_NUMBER_ID
  );
}
