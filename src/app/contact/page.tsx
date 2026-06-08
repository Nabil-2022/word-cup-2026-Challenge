import { CompliancePage } from "@/components/CompliancePage";

export default function ContactPage() {
  return (
    <CompliancePage
      title="Contact"
      description="Contact support for Prediction Challenge questions, eligibility review, or account help."
      sections={[
        {
          title: "Support Email",
          body: "For support, contact support@example.com. Include your account email and a brief description of the request."
        },
        {
          title: "Eligibility Questions",
          body: "For country availability, age review, or eligibility status questions, contact support before attempting checkout."
        },
        {
          title: "Rules Questions",
          body: "For Official Rules, scoring, Leaderboard Competition, Entry Fee, or Prizes questions, contact support and reference the relevant page."
        },
        {
          title: "FIFA Notice",
          body: "This competition is not affiliated with FIFA."
        }
      ]}
    />
  );
}
