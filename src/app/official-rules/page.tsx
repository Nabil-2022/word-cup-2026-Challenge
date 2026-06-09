import { CompliancePage } from "@/components/CompliancePage";

export default function OfficialRulesPage() {
  return (
    <CompliancePage
      title="Official Rules"
      description="Prediction Challenge rules for scoring, Prizes, and Leaderboard Competition ranking."
      sections={[
        {
          title: "Skill-Based Competition",
          body: "Participants select one prediction for each match in the grid. A correct prediction receives one point and an incorrect prediction receives zero points."
        },
        {
          title: "Leaderboard Competition",
          body: "Ranking is sorted by score in descending order, then by the time the entry was validated."
        },
        {
          title: "No Random Selection",
          body: "No winner is selected by random chance. Winners are determined by prediction accuracy and official rules."
        },
        {
          title: "Prizes",
          body: "Prizes, if offered, are awarded according to the final Leaderboard Competition results and may require additional eligibility and verification checks."
        }
      ]}
    />
  );
}
