import { NextRequest, NextResponse } from "next/server";
import { buildSlackPayload, type HelpTicketSlackInput } from "@/lib/helpTicketSlack";

const FIELDS: Exclude<keyof HelpTicketSlackInput, "urgent">[] = [
  "ticket",
  "issue",
  "note",
  "customerName",
  "customerPhone",
  "packageName",
  "packageId",
  "bookingId",
  "emName",
  "details",
];

export async function POST(request: NextRequest) {
  // Read inside the handler — on Amplify, env vars aren't guaranteed at module load.
  const webhook = process.env.SLACK_HELP_WEBHOOK_URL;
  if (!webhook) {
    console.error("[help-ticket/slack] SLACK_HELP_WEBHOOK_URL is not set");
    return NextResponse.json({ error: "Slack not configured" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only known string fields, capped, so the endpoint can't post arbitrary blobs.
  const input: HelpTicketSlackInput = {};
  for (const f of FIELDS) {
    const v = body[f];
    if (typeof v === "string") input[f] = v.slice(0, f === "note" || f === "details" ? 1000 : 200);
  }
  if (body.urgent === true) input.urgent = true;

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildSlackPayload(input, { resolvable: Boolean(process.env.SLACK_SIGNING_SECRET) })),
    });
    if (!res.ok) {
      console.error("[help-ticket/slack] Slack rejected the post:", res.status, await res.text());
      return NextResponse.json({ error: "Slack post failed" }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[help-ticket/slack] Slack post failed:", error);
    return NextResponse.json({ error: "Slack post failed" }, { status: 502 });
  }
}
