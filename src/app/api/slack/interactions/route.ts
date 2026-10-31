import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";
import { RESOLVE_ACTION_ID } from "@/lib/helpTicketSlack";

// Slack's Interactivity Request URL: button clicks on the help ticket posts
// ("Mark resolved"). The backend's ticket status endpoint isn't
// authenticated, so the Slack signature check here is the only gate.

type Block = { type: string; text?: { type: string; text: string; emoji?: boolean }; elements?: { action_id?: string }[] };
type BlockActions = {
  type: string;
  user: { id: string; name?: string };
  actions: { action_id: string; value?: string }[];
  response_url: string;
  message?: { blocks?: Block[] };
};

const MAX_AGE_S = 60 * 5;

function verified(secret: string, timestamp: string | null, signature: string | null, body: string) {
  if (!timestamp || !signature || !Number.isFinite(Number(timestamp))) return false;
  // Old requests are replays.
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > MAX_AGE_S) return false;
  const expected = `v0=${createHmac("sha256", secret).update(`v0:${timestamp}:${body}`).digest("hex")}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The post as resolved: ✅ header, no resolve button, who and when. */
function resolvedBlocks(blocks: Block[], userId: string) {
  const ts = Math.floor(Date.now() / 1000);
  return [
    ...blocks
      .map((b) =>
        b.type === "header" && b.text ? { ...b, text: { ...b.text, text: b.text.text.replace(/^🆘/, "✅ Resolved:") } } : b,
      )
      .map((b) => (b.type === "actions" ? { ...b, elements: b.elements?.filter((e) => e.action_id !== RESOLVE_ACTION_ID) } : b))
      .filter((b) => b.type !== "actions" || b.elements?.length),
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: `✅ Resolved by <@${userId}> · <!date^${ts}^{date_short_pretty} at {time}|just now>` }],
    },
  ];
}

const reply = (url: string, body: object) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export async function POST(request: NextRequest) {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) {
    console.error("[slack/interactions] SLACK_SIGNING_SECRET is not set");
    return NextResponse.json({ error: "Slack not configured" }, { status: 500 });
  }

  // The signature is over the raw body, so read it as text before parsing.
  const raw = await request.text();
  if (!verified(secret, request.headers.get("x-slack-request-timestamp"), request.headers.get("x-slack-signature"), raw)) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  let payload: BlockActions;
  try {
    payload = JSON.parse(new URLSearchParams(raw).get("payload") ?? "");
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
  const action = payload.type === "block_actions" ? payload.actions?.find((a) => a.action_id === RESOLVE_ACTION_ID) : null;
  // Other clicks (the WhatsApp link button) need nothing; Slack just wants a 200.
  if (!action?.value) return new NextResponse(null, { status: 200 });

  const ticket = action.value;
  try {
    const res = await fetch(apiUrl(`/admin/help-requests/${encodeURIComponent(ticket)}/status`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // senderName: who closed it, for the ticket thread's line (max 60).
      body: JSON.stringify({ status: "closed", senderName: payload.user.name?.slice(0, 60) }),
    });
    if (!res.ok) throw new Error(`backend ${res.status}: ${await res.text()}`);
    await reply(payload.response_url, {
      replace_original: true,
      text: `✅ ${ticket} resolved`,
      blocks: resolvedBlocks(payload.message?.blocks ?? [], payload.user.id),
    });
  } catch (error) {
    console.error(`[slack/interactions] resolving ${ticket} failed:`, error);
    // Only the clicker sees this; the post stays as it was.
    await reply(payload.response_url, {
      response_type: "ephemeral",
      replace_original: false,
      text: `Couldn't resolve ${ticket}. Try again, or close it from the admin panel.`,
    }).catch(() => {});
  }
  return new NextResponse(null, { status: 200 });
}
