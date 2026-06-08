import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const entryId = session.metadata?.entryId;
    const paymentId = session.metadata?.paymentId;

    if (entryId && paymentId) {
      if (session.payment_status !== "paid") {
        await prisma.paymentLog.create({
          data: {
            paymentId,
            eventType: "checkout_session_completed_unpaid",
            providerReference: session.id,
            payload: {
              entryId,
              paymentStatus: session.payment_status
            }
          }
        });

        return NextResponse.json({ received: true });
      }

      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: "succeeded",
            providerReference: session.id,
            amount: 1,
            platformFee: 0.3,
            prizeBudgetAmount: 0.7
          }
        }),
        prisma.entry.update({
          where: { id: entryId },
          data: { status: "locked", validatedAt: new Date(), lockedAt: new Date() }
        }),
        prisma.paymentLog.create({
          data: {
            paymentId,
            eventType: event.type,
            providerReference:
              typeof session.payment_intent === "string" ? session.payment_intent : session.id,
            payload: {
              entryId,
              stripeSessionId: session.id,
              paymentStatus: session.payment_status
            }
          }
        }),
        prisma.auditLog.create({
          data: {
            action: "stripe_checkout_completed",
            entityType: "payment",
            entityId: paymentId,
            metadata: {
              entryId,
              stripeSessionId: session.id,
              amount: "1.00",
              platformFee: "0.30",
              prizeBudgetAmount: "0.70"
            }
          }
        })
      ]);
    }
  }

  if (
    event.type === "checkout.session.async_payment_failed" ||
    event.type === "payment_intent.payment_failed"
  ) {
    const session = event.data.object;
    const entryId = "metadata" in session ? session.metadata?.entryId : undefined;
    const paymentId = "metadata" in session ? session.metadata?.paymentId : undefined;

    if (entryId && paymentId) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: { status: "failed" }
        }),
        prisma.entry.update({
          where: { id: entryId },
          data: { status: "pending_payment" }
        }),
        prisma.paymentLog.create({
          data: {
            paymentId,
            eventType: event.type,
            providerReference: "id" in session ? session.id : undefined,
            payload: { entryId }
          }
        }),
        prisma.auditLog.create({
          data: {
            action: "stripe_payment_failed",
            entityType: "payment",
            entityId: paymentId,
            metadata: { entryId, eventType: event.type }
          }
        })
      ]);
    }
  }

  if (event.type === "charge.refunded" || event.type === "charge.dispute.created") {
    const charge = event.data.object;
    const paymentIntentId =
      typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
    const payment = paymentIntentId
      ? await prisma.payment.findFirst({
          where: {
            OR: [{ providerReference: paymentIntentId }, { logs: { some: { providerReference: paymentIntentId } } }]
          }
        })
      : null;

    if (payment) {
      const status = event.type === "charge.refunded" ? "refunded" : "disputed";

      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status }
        }),
        prisma.paymentLog.create({
          data: {
            paymentId: payment.id,
            eventType: event.type,
            providerReference: charge.id,
            payload: {
              paymentIntentId
            }
          }
        }),
        prisma.auditLog.create({
          data: {
            action: event.type === "charge.refunded" ? "stripe_payment_refunded" : "stripe_payment_disputed",
            entityType: "payment",
            entityId: payment.id,
            metadata: {
              chargeId: charge.id,
              paymentIntentId
            }
          }
        })
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
