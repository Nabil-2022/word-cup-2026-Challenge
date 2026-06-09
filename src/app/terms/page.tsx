import { CompliancePage } from "@/components/CompliancePage";

export default function TermsPage() {
  return (
    <CompliancePage
      title="Terms and Conditions"
      description="Terms Apply. Eligibility Requirements Apply."
      sections={[
        {
          title: "Overview",
          body: "World Cup 2026 Prediction Challenge is a Skill-Based Competition where participants submit match predictions before checkout."
        },
        {
          title: "Entry Fee",
          body: "Entry fee applies. Checkout is available only after the participant form, eligibility checks, prediction grid, and rule acceptance are complete."
        },
        {
          title: "Participation",
          body: "Participants must be 18+ only and must meet all local eligibility requirements. The platform may block restricted countries before checkout or participation confirmation."
        },
        {
          title: "Selection of Winners",
          body: "No winner is selected by random chance. Winners are determined by prediction accuracy using the published scoring rules and Leaderboard Competition ranking."
        },
        {
          title: "FIFA Notice",
          body: "This competition is not affiliated with FIFA. Team, tournament, and event references are used only to identify the sports prediction context."
        }
      ]}
    />
  );
}
