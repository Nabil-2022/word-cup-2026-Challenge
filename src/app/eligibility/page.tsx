import { CompliancePage } from "@/components/CompliancePage";

export default function EligibilityPage() {
  return (
    <CompliancePage
      title="Eligibility"
      description="Eligibility Requirements Apply for every participant before checkout and confirmation."
      sections={[
        {
          title: "Age Requirement",
          body: "Participation is 18+ only. Date of birth is required, and underage users are automatically blocked from continuing."
        },
        {
          title: "Country Restrictions",
          body: "Local eligibility restrictions may apply. The platform may block restricted countries based on country settings, user location signals, and compliance review."
        },
        {
          title: "Accurate Information",
          body: "Participants must provide accurate identity, contact, country, and eligibility information. Entries may be excluded if required information is incomplete or inaccurate."
        },
        {
          title: "Verification",
          body: "The platform may require additional verification before awarding Prizes or publishing final results."
        }
      ]}
    />
  );
}
