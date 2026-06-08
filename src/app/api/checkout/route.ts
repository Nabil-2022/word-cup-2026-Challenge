import { NextResponse } from "next/server";
import { z } from "zod";
import { canStartCheckout } from "@/lib/functional-rules";
import { getJsonEntry } from "@/lib/json-db";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const checkoutSchema = z.object({
  entryId: z.string().min(1)
});

export async function POST(request: Request) {
  const payload = checkoutSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let entry = null;

  try {
    entry = await prisma.entry.findUnique({
      where: { id: payload.data.entryId },
      include: {
        user: true,
        predictions: true
      }
    });
  } catch {
    const jsonEntry = await getJsonEntry(payload.data.entryId);

    if (!jsonEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({
      checkoutUrl: `${appUrl}/payment?entryId=${jsonEntry.id}`,
      jsonMode: true
    });
  }

  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  if (!canStartCheckout({ ...entry, predictionsCount: entry.predictions.length })) {
    return NextResponse.json({ error: "Complete the prediction grid before checkout" }, { status: 400 });
  }

  const amountCents = 100;
  const currency = "usd";
  const payment = await prisma.payment.create({
    data: {
      userId: entry.userId,
      entryId: entry.id,
      amount: amountCents / 100,
      platformFee: 0,
      prizeBudgetAmount: 0,
      currency
    }
  });

  let session = null;

  try {
    const stripe = getStripe();
    session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: entry.user.email,
    success_url: `${appUrl}/payment/success?entryId=${entry.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/payment/cancel?entryId=${entry.id}`,
    metadata: {
      entryId: entry.id,
      paymentId: payment.id,
      product: "Prediction Challenge"
    },
    payment_intent_data: {
      metadata: {
        entryId: entry.id,
        paymentId: payment.id,
        product: "Prediction Challenge"
      }
    },
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: "World Cup 2026 Prediction Challenge Entry Fee"
          },
          unit_amount: amountCents
        },
        quantity: 1
      }
    ]
    });
  } catch {
    return NextResponse.json({
      checkoutUrl: `${appUrl}/payment?entryId=${entry.id}`,
      checkoutUnavailable: true
    });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { providerReference: session.id }
  });

  await prisma.$transaction([
    prisma.entry.update({
      where: { id: entry.id },
      data: { paymentId: payment.id }
    }),
    prisma.paymentLog.create({
      data: {
        paymentId: payment.id,
        eventType: "checkout_session_created",
        providerReference: session.id,
        payload: {
          entryId: entry.id,
          amount: "1.00",
          currency
        }
      }
    }),
    prisma.auditLog.create({
      data: {
        action: "stripe_checkout_created",
        entityType: "payment",
        entityId: payment.id,
        metadata: {
          entryId: entry.id,
          stripeSessionId: session.id,
          amount: "1.00",
          currency
        }
      }
    })
  ]);

  return NextResponse.json({ checkoutUrl: session.url });
}
