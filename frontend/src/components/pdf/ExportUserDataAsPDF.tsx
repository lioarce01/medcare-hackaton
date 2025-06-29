import React, { useState } from 'react'
import { jsPDF } from 'jspdf';
import autoTable from "jspdf-autotable";
import { Adherence, Medication, User } from '@/types';
import { toast } from "sonner";

interface ExportUserDataPDFProps {
  userData: {
    profile: User;
    medications: Medication[];
    adherence: Adherence[];
    analytics: any
  };
}

export const ExportUserDataPDF: React.FC<ExportUserDataPDFProps> = ({ userData }) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const exportUserData = async () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text('User Data Export', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    let yPosition = 40;

    // User Profile Section
    doc.setFontSize(16);
    doc.text('User Profile', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    const profileData = [
      ['Name', userData.profile.name || '-'],
      ['Email', userData.profile.email || '-'],
      ['Phone', userData.profile.phone_number || '-'],
      ['Date of Birth', formatDate(userData.profile.date_of_birth || '')],
      ['Gender', userData.profile.gender || '-'],
      ['Allergies', userData.profile.allergies?.join(', ') || '-'],
      ['Medical Conditions', userData.profile.conditions?.join(', ') || '-'],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Field', 'Value']],
      body: profileData,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Medications Section
    if (userData.medications && userData.medications.length > 0) {
      doc.setFontSize(16);
      doc.text('Medications', 20, yPosition);
      yPosition += 10;

      const medicationData = userData.medications.map(med => [
        med.name,
        `${med.dosage.amount} ${med.dosage.unit}`,
        med.frequency.type,
        formatDate(med.start_date),
        med.active ? 'Active' : 'Inactive'
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Name', 'Dosage', 'Frequency', 'Start Date', 'Status']],
        body: medicationData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Adherence Section
    if (userData.adherence && userData.adherence.length > 0) {
      doc.setFontSize(16);
      doc.text('Adherence History', 20, yPosition);
      yPosition += 10;

      const adherenceData = userData.adherence.slice(0, 50).map(adh => [
        formatDateTime(adh.scheduled_datetime),
        adh.status,
        formatDateTime(adh.taken_time || ''),
        adh.notes || '-'
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Scheduled Time', 'Status', 'Taken Time', 'Notes']],
        body: adherenceData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Analytics Section
    if (userData.analytics) {
      doc.setFontSize(16);
      doc.text('Analytics Summary', 20, yPosition);
      yPosition += 10;

      const analyticsData = [
        ['Today Adherence', `${userData.analytics.today?.adherenceRate || 0}%`],
        ['Week Adherence', `${userData.analytics.week?.adherenceRate || 0}%`],
        ['Month Adherence', `${userData.analytics.month?.adherenceRate || 0}%`],
        ['Active Medications', userData.medications?.filter(m => m.active).length || 0],
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: analyticsData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
      });
    }

    // Save the PDF
    const fileName = `user_data_${userData.profile.name?.replace(/\s+/g, '_') || 'export'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportUserData();
      toast.success("Export Successful", {
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast.error("Export Failed", {
        description: "Failed to export your data. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExporting ? 'Exporting...' : 'Export PDF'}
    </button>
  );
};