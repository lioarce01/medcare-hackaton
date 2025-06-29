import { useAdherenceHistory } from "@/hooks/useAdherence";
import { useAnalyticsOverview } from "@/hooks/useAnalyticsData";
import { useMedications } from "@/hooks/useMedications";
import { useUserProfile } from "@/hooks/useUser";
import { ExportUserDataPDF } from "./ExportUserDataAsPDF";


const ExportUserDataCall = () => {
  const { data: user } = useUserProfile();
  const { data: medicationsData } = useMedications();
  const { data: adherenceData } = useAdherenceHistory();
  const { data: analyticsOverview } = useAnalyticsOverview();

  // Extract medications array from paginated response
  const medications = medicationsData?.data || [];

  // Extract adherence array from paginated response
  const adherence = adherenceData?.data || [];

  // Don't render if essential data is missing
  if (!user || !analyticsOverview) {
    return (
      <button
        disabled
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  return (
    <ExportUserDataPDF
      userData={{
        profile: {
          ...user,
          // Make sure emergency_contact exists or provide default
          emergency_contact: user.emergency_contact || {
            name: '',
            phone_number: '',
            relationship: ''
          },
        },
        medications,
        adherence,
        analytics: analyticsOverview
      }}
    />
  );
};

export default ExportUserDataCall;