import { CompliancePage } from "@/components/CompliancePage";

export default function PrivacyPage() {
  return (
    <CompliancePage
      title="Privacy Policy"
      description="This page explains how participant and admin data is handled for the Prediction Challenge."
      sections={[
        {
          title: "Data Collected",
          body: "The platform may collect name, email, phone, country code, date of birth, prediction selections, payment status, device details, and compliance logs."
        },
        {
          title: "Use of Data",
          body: "Data is used to operate the Skill-Based Competition, verify eligibility, process Entry Fee checkout, calculate rankings, publish the Leaderboard Competition, and support compliance review."
        },
        {
          title: "Payment Data",
          body: "Checkout is processed through Stripe. The platform stores payment references and status information, but does not need to store full payment card details."
        },
        {
          title: "Retention",
          body: "Records may be retained for operations, dispute review, audit logs, legal compliance, and support requests."
        },
        {
          title: "Contact",
          body: "Participants may contact support for privacy questions, account questions, or eligibility review requests."
        }
      ]}
    />
  );
}
