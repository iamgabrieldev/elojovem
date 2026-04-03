import { NextResponse } from "next/server";
import {
  findUsersByBillingId,
  getUserProfile,
  markPaymentCompleted,
} from "@/lib/firestore/repos";

type WebhookBody = {
  event?: string;
  data?: {
    id?: string;
    externalId?: string | null;
    status?: string;
  };
};

export async function POST(request: Request) {
  const url = new URL(request.url);
  const secret =
    process.env.ABACATEPAY_WEBHOOK_SECRET?.trim() ||
    process.env.ABACATE_WEBHOOK_SECRET?.trim();
  if (secret) {
    const q = url.searchParams.get("webhookSecret");
    if (q !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  let body: WebhookBody;
  try {
    body = (await request.json()) as WebhookBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (body.event !== "billing.paid") {
    return NextResponse.json({ ok: true });
  }

  const billingId = body.data?.id;
  const externalUserId = body.data?.externalId ?? undefined;

  if (!billingId && !externalUserId) {
    return NextResponse.json({ ok: true });
  }

  if (billingId) {
    const uids = await findUsersByBillingId(billingId);
    for (const uid of uids) {
      await markPaymentCompleted(uid);
    }
  }
  if (externalUserId) {
    const u = await getUserProfile(externalUserId);
    if (u?.requiresPaymentCompletion) {
      await markPaymentCompleted(externalUserId);
    }
  }

  return NextResponse.json({ ok: true });
}
