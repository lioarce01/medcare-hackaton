import React from 'react'
import { ExportUserDataPDFProps } from '../types/ui_types'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const ExportUserDataPDF: React.FC<ExportUserDataPDFProps> = ({ userData }) => {
  const handleExport = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(22);
    doc.text(`${userData.profile.name} - Adherence Data`, 14, 18);

    // Profile Section
    doc.setFontSize(16);
    doc.text("Profile", 14, 30);
    doc.setFontSize(12);
    autoTable(doc, {
      startY: 34,
      theme: "grid",
      head: [["Field", "Value"]],
      body: [
        ["Name", userData.profile.name],
        ["Email", userData.profile.email],
        ["Date of Birth", userData.profile.date_of_birth],
        ["Gender", userData.profile.gender],
        ["Phone", userData.profile.phone_number],
        ["Allergies", userData.profile.allergies?.join(", ")],
        ["Conditions", userData.profile.conditions?.join(", ")],
        ["Preferred Reminder Times", userData.profile.preferred_reminder_time?.join(", ")],
        ["Email Notifications", userData.profile.email_notifications_enabled ? "Enabled" : "Disabled"],
        ["Emergency Contact Name", userData.profile.emergency_contact?.name],
        ["Emergency Contact Relationship", userData.profile.emergency_contact?.relationship],
        ["Emergency Contact Phone", userData.profile.emergency_contact?.phone_number],
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
      body: userData.medications.map((m) => [
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
      body: userData.adherence.map((a) => [
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
        ["Total Doses", userData.analytics?.overall?.total ?? "-"],
        ["Taken", userData.analytics?.overall?.taken ?? "-"],
        ["Skipped", userData.analytics?.overall?.skipped ?? "-"],
        ["Adherence Rate (%)", userData.analytics?.overall?.adherenceRate?.toFixed(2) ?? "-"],
      ],
      styles: { fontSize: 10 },
    });

    // Save the PDF with user name and date
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const safeName = (userData.profile.name || "user").replace(/[^a-z0-9]/gi, "_");
    doc.save(`${safeName} - ${dateStr}.pdf`);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      Export Data
    </button>
  );
};
