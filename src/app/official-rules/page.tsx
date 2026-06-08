import { CompliancePage } from "@/components/CompliancePage";

export default function OfficialRulesPage() {
  return (
    <CompliancePage
      title="Official Rules"
      description="Prediction Challenge rules for scoring, tie-break criteria, Prizes, and Leaderboard Competition ranking."
      sections={[
        {
          title: "Skill-Based Competition",
          body: "Participants select one prediction for each match in the grid. A correct prediction receives one point and an incorrect prediction receives zero points."
        },
        {
          title: "Tie-Break Criteria",
          body: "Each participant must answer how many total goals will be scored during the group stage. After official results are entered, the platform calculates the distance between the answer and the actual total."
        },
        {
          title: "Leaderboard Competition",
          body: "Ranking is sorted by score in descending order, then by tie-break distance in ascending order, then by the time the entry was validated."
        },
        {
          title: "No Random Selection",
          body: "No winner is selected by random chance. Winners are determined by prediction accuracy and tie-break criteria."
        },
        {
          title: "Prizes",
          body: "Prizes, if offered, are awarded according to the final Leaderboard Competition results and may require additional eligibility and verification checks."
        }
      ]}
    />
  );
}
