const disclaimerItems = [
  "18+ only.",
  "Entry fee applies.",
  "Terms Apply.",
  "Eligibility Requirements Apply.",
  "No winner is selected by random chance.",
  "Winners are determined by prediction accuracy and tie-break criteria.",
  "Local eligibility restrictions may apply.",
  "The platform may block restricted countries.",
  "This competition is not affiliated with FIFA."
];

export function ComplianceDisclaimers() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
      <p className="font-semibold text-night">Prediction Challenge notice</p>
      <ul className="mt-2 grid gap-1">
        {disclaimerItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function SiteComplianceFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 text-sm text-slate-600">
        <ComplianceDisclaimers />
        <nav className="flex flex-wrap gap-3 font-semibold text-slate-700">
          <a href="/terms">Terms and Conditions</a>
          <a href="/official-rules">Official Rules</a>
          <a href="/eligibility">Eligibility</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/responsible-participation">Responsible Participation</a>
          <a href="/contact">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
