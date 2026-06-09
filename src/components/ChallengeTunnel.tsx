"use client";

import { useEffect, useMemo, useState } from "react";
import { rememberLocalJsonEntry } from "@/components/admin/LocalJsonEntries";

type Choice = "ONE" | "DRAW" | "TWO";

type MatchItem = {
  id: string;
  groupName: string | null;
  team1: string;
  team2: string;
  matchDate: string | Date;
};

type ParticipantForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  birthDate: string;
};

type DraftState = {
  participant: ParticipantForm;
  predictions: Record<string, Choice>;
  termsAccepted: boolean;
};

const emptyParticipant: ParticipantForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  countryCode: "",
  birthDate: ""
};

const draftKey = "wc2026_prediction_challenge_draft";
const countryOptions = ["US", "CA", "GB", "FR", "MA", "MX", "DE", "ES", "IT", "BR"];

function calculateAge(birthDate: string) {
  if (!birthDate) {
    return null;
  }

  const date = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const birthdayThisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate());

  if (birthdayThisYear > today) {
    age -= 1;
  }

  return age;
}

function sortMatches(matches: MatchItem[]) {
  const matchesById = new Map<string, MatchItem>();

  for (const match of matches) {
    matchesById.set(match.id, match);
  }

  return [...matchesById.values()].sort((first, second) => {
    const firstDate = new Date(first.matchDate).getTime();
    const secondDate = new Date(second.matchDate).getTime();

    if (firstDate !== secondDate) {
      return firstDate - secondDate;
    }

    return (first.groupName ?? "").localeCompare(second.groupName ?? "");
  });
}

async function readApiJson(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as Record<string, any>;
  } catch {
    return { error: text };
  }
}

export function ChallengeTunnel() {
  const [step, setStep] = useState(1);
  const [participant, setParticipant] = useState<ParticipantForm>(emptyParticipant);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [allowedCountries, setAllowedCountries] = useState<string[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Choice>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lockedEntryId, setLockedEntryId] = useState<string | null>(null);

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(draftKey);
    if (savedDraft) {
      const parsedDraft = JSON.parse(savedDraft) as DraftState;
      setParticipant(parsedDraft.participant);
      setPredictions(parsedDraft.predictions);
      setTermsAccepted(parsedDraft.termsAccepted);
    }

    async function loadInitialData() {
      const [matchesResponse, eligibilityResponse] = await Promise.all([
        fetch("/api/matches"),
        fetch("/api/eligibility")
      ]);
      const matchesData = (await matchesResponse.json()) as { matches: MatchItem[]; source?: string };
      const eligibilityData = (await eligibilityResponse.json()) as { allowedCountries: string[] };

      setMatches(sortMatches(matchesData.matches));
      setAllowedCountries(eligibilityData.allowedCountries);
    }

    loadInitialData().catch(() => {
      setMessage("Unable to load the Prediction Challenge grid. Please refresh.");
    });
  }, []);

  const age = useMemo(() => calculateAge(participant.birthDate), [participant.birthDate]);
  const isAdult = age !== null && age >= 18;
  const countryAllowed =
    participant.countryCode.length === 2 && allowedCountries.includes(participant.countryCode.toUpperCase());
  const participantComplete =
    participant.firstName.trim() &&
    participant.lastName.trim() &&
    participant.email.trim() &&
    participant.countryCode.trim() &&
    participant.birthDate;
  const totalMatches = matches.length;
  const completedMatches = matches.filter((match) => Boolean(predictions[match.id])).length;
  const gridComplete = totalMatches > 0 && completedMatches === totalMatches;
  const readyForCheckout =
    participantComplete && isAdult && countryAllowed && gridComplete && termsAccepted;
  const missingCheckoutItems = [
    !termsAccepted ? "Official rules acceptance is required." : null,
    !gridComplete ? "Complete every match prediction." : null,
    !participantComplete || !isAdult || !countryAllowed ? "Eligibility must be confirmed." : null
  ].filter(Boolean);

  function saveDraft(nextMessage = "Draft saved on this device.") {
    const draft: DraftState = {
      participant,
      predictions,
      termsAccepted
    };
    window.localStorage.setItem(draftKey, JSON.stringify(draft));
    setMessage(nextMessage);
  }

  function updateParticipant(field: keyof ParticipantForm, value: string) {
    setParticipant((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  function chooseMatch(matchId: string, choice: Choice) {
    setPredictions((current) => ({ ...current, [matchId]: choice }));
    setMessage("");
  }

  function continueFromParticipant() {
    if (!participantComplete) {
      setMessage("Complete your participant details before continuing.");
      return;
    }

    if (!isAdult) {
      setMessage("Participants must be 18+.");
      return;
    }

    if (!countryAllowed) {
      setMessage("This Prediction Challenge is not available in your country.");
      return;
    }

    saveDraft("Eligibility confirmed. Continue to the prediction grid.");
    setStep(2);
  }

  async function startCheckout() {
    if (!readyForCheckout) {
      setMessage("Complete every required field and accept the rules before checkout.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const entryResponse = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            ...participant,
            countryCode: participant.countryCode.toUpperCase(),
            isAdult
          },
          tieBreakAnswer: 0,
          termsAccepted,
          predictions: matches.map((match) => ({
            matchId: match.id,
            choice: predictions[match.id]
          }))
        })
      });

      const entryData = await readApiJson(entryResponse);
      if (!entryResponse.ok) {
        throw new Error(entryData.error ?? "Unable to create your entry.");
      }

      if (entryData.jsonMode && entryData.entry) {
        rememberLocalJsonEntry(entryData.entry);
      }

      const checkoutResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: entryData.entry.id })
      });
      const checkoutData = await readApiJson(checkoutResponse);

      if (!checkoutResponse.ok || !checkoutData.checkoutUrl) {
        throw new Error(checkoutData.error ?? "Unable to start checkout.");
      }

      setLockedEntryId(entryData.entry.id);
      window.localStorage.removeItem(draftKey);
      window.location.href = checkoutData.checkoutUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout could not be started.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="sticky top-0 z-10 -mx-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
          <span>Progress</span>
          <span>
            {completedMatches} / {totalMatches} matches
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-pitch transition-all"
            style={{ width: totalMatches ? `${(completedMatches / totalMatches) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {message ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      {lockedEntryId ? (
        <div className="mt-4 rounded-lg border border-pitch bg-white px-4 py-3 text-sm text-pitch">
          Checkout started. Entry reference: {lockedEntryId}
        </div>
      ) : null}

      {step === 1 ? (
        <section className="mt-6 space-y-4">
          <h2 className="text-xl font-bold text-night">Participant details</h2>
          <div className="grid gap-3">
            <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="First name" value={participant.firstName} onChange={(event) => updateParticipant("firstName", event.target.value)} />
            <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Last name" value={participant.lastName} onChange={(event) => updateParticipant("lastName", event.target.value)} />
            <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Email" type="email" value={participant.email} onChange={(event) => updateParticipant("email", event.target.value)} />
            <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Phone" value={participant.phone} onChange={(event) => updateParticipant("phone", event.target.value)} />
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Date of birth
              <input className="rounded-lg border border-slate-300 px-4 py-3" required type="date" value={participant.birthDate} onChange={(event) => updateParticipant("birthDate", event.target.value)} />
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Country
              <select className="rounded-lg border border-slate-300 px-4 py-3" value={participant.countryCode} onChange={(event) => updateParticipant("countryCode", event.target.value)}>
                <option value="">Select country</option>
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">
            {participant.birthDate ? (isAdult ? "18+ confirmed." : "Participants must be 18+.") : "Date of birth is required."}
            {participant.countryCode ? ` Country check: ${countryAllowed ? "available" : "not available"}.` : ""}
          </div>

          <button className="w-full rounded-lg bg-pitch px-5 py-4 font-bold text-white disabled:bg-slate-300" type="button" onClick={continueFromParticipant}>
            Continue
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-night">Prediction grid</h2>
            <button className="text-sm font-semibold text-pitch" type="button" onClick={() => saveDraft()}>
              Save draft
            </button>
          </div>
          <div className="space-y-3">
            {matches.map((match) => (
              <div key={match.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-3 text-sm text-slate-500">{match.groupName ?? "Group stage"}</div>
                <div className="mb-3 font-semibold text-night">
                  {match.team1} vs {match.team2}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["ONE", match.team1],
                    ["DRAW", "Draw"],
                    ["TWO", match.team2]
                  ].map(([choice, label]) => (
                    <button
                      key={choice}
                      className={`rounded-lg border px-3 py-3 text-sm font-bold ${
                        predictions[match.id] === choice
                          ? "border-pitch bg-pitch text-white"
                          : "border-slate-300 bg-white text-night"
                      }`}
                      type="button"
                      onClick={() => chooseMatch(match.id, choice as Choice)}
                    >
                      {choice === "ONE" ? "1" : choice === "TWO" ? "2" : "X"}
                      <span className="mt-1 block truncate text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full rounded-lg bg-pitch px-5 py-4 font-bold text-white disabled:bg-slate-300" disabled={!gridComplete} type="button" onClick={() => setStep(3)}>
            Review
          </button>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="mt-6 space-y-4">
          <h2 className="text-xl font-bold text-night">Review</h2>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <p className="font-semibold text-night">{participant.firstName} {participant.lastName}</p>
            <p>{participant.email}</p>
            <p>{completedMatches} predictions completed.</p>
            <p>Checkout starts only after all required fields are complete.</p>
            <p className="mt-3">Entry fee applies. Terms and eligibility conditions apply.</p>
            <p>
              This is a skill-based prediction competition. Winners are determined by prediction accuracy and official
              rules.
            </p>
          </div>
          <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <input className="mt-1" type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
            <span>I confirm that I am 18+, located in an approved country, and accept the official rules.</span>
          </label>
          <button className="w-full rounded-lg bg-pitch px-5 py-4 font-bold text-white disabled:bg-slate-300" disabled={!readyForCheckout || isLoading} type="button" onClick={startCheckout}>
            {isLoading ? "Starting checkout..." : "Continue to Entry Fee Checkout"}
          </button>
          {!readyForCheckout && missingCheckoutItems.length ? (
            <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">
              {missingCheckoutItems[0]}
            </div>
          ) : null}
          <button className="w-full rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-night" type="button" onClick={() => setStep(2)}>
            Back to grid
          </button>
        </section>
      ) : null}
    </div>
  );
}
