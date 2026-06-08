"use client";

import { useEffect, useState } from "react";

type EntryStatusResponse = {
  entry?: {
    id: string;
    status: string;
    lockedAt: string | null;
    completedMatches: number;
    totalMatches: number;
    payments: { status: string }[];
  };
  error?: string;
};

export function ConfirmationStatus() {
  const [entry, setEntry] = useState<EntryStatusResponse["entry"]>();
  const [message, setMessage] = useState("Checking entry status...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const entryId = params.get("entryId");

    if (!entryId) {
      setMessage("No entry reference was provided.");
      return;
    }

    async function loadEntry() {
      const response = await fetch(`/api/entries/${entryId}`);
      const data = (await response.json()) as EntryStatusResponse;

      if (!response.ok || !data.entry) {
        setMessage(data.error ?? "Unable to load entry status.");
        return;
      }

      setEntry(data.entry);
      setMessage("");
    }

    loadEntry().catch(() => {
      setMessage("Unable to load entry status.");
    });
  }, []);

  if (message) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">{message}</div>;
  }

  if (!entry) {
    return null;
  }

  const isLocked = entry.status === "locked";
  const latestPaymentStatus = entry.payments[0]?.status ?? "pending";

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-pitch">
          {isLocked ? "Grid locked" : "Webhook pending"}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-night">
          {isLocked ? "Your entry is confirmed." : "Checkout received. Final confirmation is pending."}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Status: {entry.status}. Payment status: {latestPaymentStatus}. Completed matches:{" "}
          {entry.completedMatches} / {entry.totalMatches}.
        </p>
      </div>
      {!isLocked ? (
        <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
          The grid remains editable only before successful checkout confirmation. Refresh this page after Stripe
          completes webhook delivery.
        </div>
      ) : null}
    </div>
  );
}
