import { ComplianceDisclaimers } from "@/components/ComplianceDisclaimers";
import { PageShell } from "@/components/PageShell";

type Section = {
  title: string;
  body: string;
};

export function CompliancePage({
  title,
  description,
  sections
}: {
  title: string;
  description: string;
  sections: Section[];
}) {
  return (
    <PageShell title={title} description={description}>
      <div className="grid max-w-3xl gap-4">
        {sections.map((section) => (
          <section key={section.title} className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-night">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{section.body}</p>
          </section>
        ))}
        <ComplianceDisclaimers />
      </div>
    </PageShell>
  );
}
