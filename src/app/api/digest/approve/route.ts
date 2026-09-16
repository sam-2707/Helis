import { NextResponse } from "next/server";
import { z } from "zod";

import { demoStore } from "@/lib/demo-store";

const bodySchema = z.object({
  digestId: z.string(),
  summaryEn: z.string().min(1),
  summaryHi: z.string().min(1),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const digest = demoStore.updateDigest(parsed.data.digestId, {
    summaryEn: parsed.data.summaryEn,
    summaryHi: parsed.data.summaryHi,
    status: "approved",
  });

  if (!digest) {
    return NextResponse.json({ error: "Digest not found" }, { status: 404 });
  }

  return NextResponse.json({ digest });
}
