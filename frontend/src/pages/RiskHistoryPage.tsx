import { useState } from "react";
import { useMedications } from "../hooks/useMedications";
import { useRiskHistory } from "../hooks/useRiskHistory";
import { formatDate } from "../lib/formatters";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const RiskHistoryPage = () => {
  const { data: medicationsData, isLoading: medsLoading, error: medsError } = useMedications();
  const [medicationId, setMedicationId] = useState<string>("");

  const { data: riskHistory, isLoading: riskLoading, error: riskError } = useRiskHistory(medicationId);

  // Prepara datos para Chart.js
  const chartData = {
    labels: riskHistory?.map((risk: any) => formatDate(risk.created_at)) || [],
    datasets: [
      {
        label: "Risk Score",
        data: riskHistory?.map((risk: any) => risk.risk_score) || [],
        borderColor: "rgba(37, 99, 235, 1)", // azul
        backgroundColor: "rgba(37, 99, 235, 0.3)",
        fill: true,
        tension: 0.3, // curva suave
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Risk Score Evolution Over Time",
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 1,
        title: { display: true, text: "Risk Score" },
      },
      x: {
        title: { display: true, text: "Date" },
      },
    },
  };

  return (
    <div className="max-w-2xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-semibold mb-4 text-blue-700">Medication Risk History</h1>

      {medsLoading && <p className="text-gray-600 animate-pulse">Loading medications...</p>}
      {medsError && <p className="text-red-600">Oops! We couldn’t load your medications. Please try again.</p>}

      {!medsLoading && medicationsData && (
        <div className="mb-6">
          <label htmlFor="medication-select" className="block text-gray-700 mb-2 font-medium">
            Select a Medication:
          </label>
          <select
            id="medication-select"
            value={medicationId}
            onChange={(e) => setMedicationId(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">-- Choose a medication --</option>
            {medicationsData.all.map((med) => (
              <option key={med.id} value={med.id}>
                {med.name}
              </option>
            ))}
          </select>

          {!riskLoading && Array.isArray(riskHistory) && riskHistory.length === 0 && (
            <p className="text-gray-500 mt-4">No risk history found for this medication.</p>
          )}
        </div>
      )}

      {!medicationId && <p className="text-gray-500">Please select a medication to view your risk history.</p>}

      {riskLoading && <p className="text-blue-500 animate-pulse">Fetching your risk history...</p>}

      {riskError && <p className="text-red-600">Could not retrieve risk data. Try again later.</p>}

      {riskHistory && riskHistory.length > 0 && (
        <>
          <div className="bg-white border rounded-lg shadow-md p-4 mt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Risk History</h2>
            <ul className="space-y-2">
              {riskHistory.map((risk: any) => (
                <li key={risk.id} className="text-gray-700">
                  <span className="font-medium">{formatDate(risk.created_at)}</span> — Risk Score:{" "}
                  <span className="text-blue-600 font-semibold">{risk.risk_score.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <Line data={chartData} options={chartOptions} />
          </div>
        </>
      )}
    </div>
  );
};
