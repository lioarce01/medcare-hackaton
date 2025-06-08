import { useRiskHistory } from '../hooks/useRiskHistory';

const RiskHistory = ({medicationId}: { medicationId: string }) => {
  const { data, isLoading, error } = useRiskHistory(medicationId);

  if (!medicationId) return <p>Select a medication</p>;
  if (isLoading) return <p>Loading risk history...</p>;
  if (error) return <p>Error: {(error as Error).message}</p>;

  return (
    <div>
      <h2>Risk History</h2>
      {data && data.length > 0 ? (
        <ul>
          {data.map((risk: any) => (
            <li key={risk.id}>
              {new Date(risk.created_at).toLocaleDateString()} - Risk Score: {risk.risk_score}
            </li>
          ))}
        </ul>
      ) : (
        <p>No risk history found.</p>
      )}
    </div>
  );
}

export default RiskHistory