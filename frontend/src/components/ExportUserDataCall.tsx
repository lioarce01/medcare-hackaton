import { ExportUserDataPDF } from './ExportUserDataPDF'
import { useMedications } from '../hooks/useMedications';
import { useGetAdherenceHistory } from '../hooks/useAdherence';
import { summarizeAnalytics, useGetAnalyticsStats } from '../hooks/useAnalytics';
import { useUser } from '../hooks/useUser';

const ExportUserDataCall = () => {

    const { data: user } = useUser()
const { data: medications = [] } = useMedications();
const { data: adherence = [] } = useGetAdherenceHistory();
const { data: analytics = [] } = useGetAnalyticsStats()

const analyticsReports = summarizeAnalytics(analytics)

  return (
    <>
        <ExportUserDataPDF
        profile={user}
        medications={medications}
        adherence={adherence}
        analytics={analyticsReports}
        />
    </>
  )
}

export default ExportUserDataCall