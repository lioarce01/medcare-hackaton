import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportUserDataPDFProps {
  profile: any;
  medications: any[];
  adherence: any[];
  analytics: any;
}

export const ExportUserDataPDF: React.FC<ExportUserDataPDFProps> = ({
  profile,
  medications,
  adherence,
  analytics,
}) => {
  const handleExport = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(22);
    doc.text(`${profile.name} - Adherence Data`, 14, 18);

    // Profile Section
    doc.setFontSize(16);
    doc.text("Profile", 14, 30);
    doc.setFontSize(12);
    autoTable(doc, {
      startY: 34,
      theme: "grid",
      head: [["Field", "Value"]],
      body: [
        ["Name", profile.name],
        ["Email", profile.email],
        ["Date of Birth", profile.date_of_birth],
        ["Gender", profile.gender],
        ["Phone", profile.phone_number],
        ["Allergies", profile.allergies?.join(", ")],
        ["Conditions", profile.conditions?.join(", ")],
        ["Preferred Reminder Times", profile.preferred_reminder_time?.join(", ")],
        ["Email Notifications", profile.email_notifications_enabled ? "Enabled" : "Disabled"],
        ["Emergency Contact Name", profile.emergency_contact?.name],
        ["Emergency Contact Relationship", profile.emergency_contact?.relationship],
        ["Emergency Contact Phone", profile.emergency_contact?.phone_number],
      ],
      styles: { fontSize: 10 },
    });

    let y = ((doc as any).lastAutoTable?.finalY ?? 44) + 10;

    // Medications Section
    doc.setFontSize(16);
    doc.text("Medications", 14, y);
    doc.setFontSize(12);
    autoTable(doc, {
      startY: y + 4,
      theme: "striped",
      head: [["Name", "Dosage", "Type", "Frequency", "Active"]],
      body: medications.map((m) => [
        m.name,
        `${m.dosage?.amount} ${m.dosage?.unit}`,
        m.medication_type,
        m.frequency?.times_per_day
          ? `${m.frequency.times_per_day}x/day`
          : m.frequency,
        m.active ? "Yes" : "No",
      ]),
      styles: { fontSize: 10 },
    });

    y = ((doc as any).lastAutoTable?.finalY ?? y + 14) + 10;

    // Adherence Section
    doc.setFontSize(16);
    doc.text("Adherence Records", 14, y);
    doc.setFontSize(12);
    autoTable(doc, {
      startY: y + 4,
      theme: "grid",
      head: [["Date", "Medication", "Scheduled Time", "Status", "Taken Time"]],
      body: adherence.map((a) => [
        a.scheduled_date,
        a.medication?.name,
        a.scheduled_time,
        a.status,
        a.taken_time || "-",
      ]),
      styles: { fontSize: 10 },
    });

    y = ((doc as any).lastAutoTable?.finalY ?? y + 14) + 10;

    // Analytics Section
    doc.setFontSize(16);
    doc.text("Analytics", 14, y);
    doc.setFontSize(12);
    autoTable(doc, {
      startY: y + 4,
      theme: "grid",
      head: [["Metric", "Value"]],
      body: [
        ["Total Doses", analytics?.overall?.total ?? "-"],
        ["Taken", analytics?.overall?.taken ?? "-"],
        ["Missed", analytics?.overall?.missed ?? "-"],
        ["Skipped", analytics?.overall?.skipped ?? "-"],
        ["Adherence Rate (%)", analytics?.overall?.adherenceRate?.toFixed(2) ?? "-"],
      ],
      styles: { fontSize: 10 },
    });

    // Save the PDF with user name and date
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const safeName = (profile.name || "user").replace(/[^a-z0-9]/gi, "_");
    doc.save(`${safeName} - ${dateStr}.pdf`);
  };

  return (
    <button
      onClick={handleExport}
      className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow hover:from-blue-600 hover:to-indigo-700 transition"
    >
      Download My Data as PDF
    </button>
  );
};
