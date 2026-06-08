import { CompliancePage } from "@/components/CompliancePage";

export default function ResponsibleParticipationPage() {
  return (
    <CompliancePage
      title="Responsible Participation"
      description="Participation should be informed, voluntary, and consistent with the published rules."
      sections={[
        {
          title: "Skill-Based Format",
          body: "This is a skill-based prediction competition. Winners are determined by prediction accuracy and tie-break rules."
        },
        {
          title: "Entry Fee Notice",
          body: "Entry fee applies. Participants should review Terms Apply and Eligibility Requirements Apply notices before checkout."
        },
        {
          title: "No Random Winner Selection",
          body: "No winner is selected by random chance. Leaderboard results are based on scoring performance and tie-break criteria."
        },
        {
          title: "Personal Limits",
          body: "Participants should enter only if they understand the rules, eligibility requirements, scoring method, and Entry Fee."
        },
        {
          title: "Support",
          body: "Participants may contact support to request help, ask about eligibility, or review account status."
        }
      ]}
    />
  );
}
