import React from 'react'
import { jsPDF } from 'jspdf';
import autoTable from "jspdf-autotable";
import { Adherence, Medication, User } from '@/types';

interface ExportUserDataPDFProps {
  userData: {
    profile: User;
    medications: Medication[];
    adherence: Adherence[];
    analytics: any
  };
}

export const ExportUserDataPDF: React.FC<ExportUserDataPDFProps> = ({ userData }) => {

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const handleExport = () => {
    try {
      // Create PDF with UTF-8 support
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16,
        compress: true
      });

      // Use helvetica font for all languages
      doc.setFont('helvetica', 'normal');

      // Title
      doc.setFontSize(22);
      doc.text(`${userData.profile.name} - Medical Data Export`, 14, 20);

      // Generation date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

      let currentY = 40;

      // Configure autoTable styles
      const tableConfig = {
        styles: {
          fontSize: 9,
          cellPadding: 2,
          overflow: 'linebreak' as const,
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [66, 139, 202] as [number, number, number],
          textColor: [255, 255, 255] as [number, number, number],
          fontStyle: 'bold' as const
        },
        margin: { top: 15 }
      };

      // ========== PROFILE SECTION ==========
      doc.setFontSize(16);
      doc.text('Personal Information', 14, currentY);

      autoTable(doc, {
        startY: currentY + 4,
        theme: "grid",
        head: [["Field", "Value"]],
        body: [
          ['Full Name', userData.profile.name || '-'],
          ['Email', userData.profile.email || '-'],
          ['Date of Birth', formatDate(userData.profile.date_of_birth ?? '')],
          ['Gender', userData.profile.gender || '-'],
          ['Phone Number', userData.profile.phone_number || '-'],
          ['Allergies', userData.profile.allergies?.join(", ") || 'None'],
          ['Medical Conditions', userData.profile.conditions?.join(", ") || 'None'],
          ['Account Created', formatDate(userData.profile.created_at)],
          ['Subscription Plan', userData.profile.subscription_plan || 'Free'],
          ['Subscription Status', userData.profile.subscription_status || 'None'],
        ],
        ...tableConfig
      });

      currentY = ((doc as any).lastAutoTable?.finalY ?? currentY + 20) + 10;

      // Emergency Contact Section
      if (userData.profile.emergency_contact) {
        doc.setFontSize(14);
        doc.text('Emergency Contact', 14, currentY);

        autoTable(doc, {
          startY: currentY + 4,
          theme: "striped",
          head: [["Field", "Value"]],
          body: [
            ['Name', userData.profile.emergency_contact.name || '-'],
            ['Relationship', userData.profile.emergency_contact.relationship || '-'],
            ['Phone Number', userData.profile.emergency_contact.phone_number || '-'],
          ],
          ...tableConfig
        });

        currentY = ((doc as any).lastAutoTable?.finalY ?? currentY + 20) + 10;
      }

      // Settings Section
      doc.setFontSize(14);
      doc.text('Notification Settings', 14, currentY);

      autoTable(doc, {
        startY: currentY + 4,
        theme: "striped",
        head: [["Setting", "Value"]],
        body: [
          ['Email Notifications', userData.profile.settings?.email_enabled ? 'Enabled' : 'Disabled'],
          ['Timezone', userData.profile.settings?.timezone || '-'],
          ['Preferred Times', userData.profile.settings?.preferred_times?.join(", ") || 'Not set'],
        ],
        ...tableConfig
      });

      currentY = ((doc as any).lastAutoTable?.finalY ?? currentY + 20) + 15;

      // ========== MEDICATIONS SECTION ==========
      if (userData.medications && userData.medications.length > 0) {
        // Check if we need a new page
        if (currentY > 220) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(16);
        doc.text('Medications', 14, currentY);

        autoTable(doc, {
          startY: currentY + 4,
          theme: "striped",
          head: [
            [
              'Name',
              'Dosage',
              'Type',
              'Frequency',
              'Instructions',
              'Start Date',
              'Status',
              'Side Effects'
            ]
          ],
          body: userData.medications.map((med) => [
            med.name,
            `${med.dosage?.amount || ''} ${med.dosage?.unit || ''}`.trim() || '-',
            med.medication_type || '-',
            med.frequency?.times_per_day
              ? `${med.frequency.times_per_day}x/day`
              : med.frequency?.interval
                ? `Every ${med.frequency.interval}h`
                : 'Custom',
            med.instructions || '-',
            formatDate(med.start_date),
            med.active ? 'Active' : 'Inactive',
            med.side_effects_to_watch?.join(", ") || 'None'
          ]),
          ...tableConfig,
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 20 },
            2: { cellWidth: 15 },
            3: { cellWidth: 20 },
            4: { cellWidth: 30 },
            5: { cellWidth: 20 },
            6: { cellWidth: 15 },
            7: { cellWidth: 25 }
          }
        });

        currentY = ((doc as any).lastAutoTable?.finalY ?? currentY + 20) + 15;
      }

      // ========== ANALYTICS SECTION ==========
      if (userData.analytics) {
        // Check if we need a new page
        if (currentY > 200) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(16);
        doc.text('Adherence Analytics', 14, currentY);

        // Overall Stats
        doc.setFontSize(12);
        doc.text('Overall Performance', 14, currentY + 8);

        autoTable(doc, {
          startY: currentY + 12,
          theme: "grid",
          head: [["Period", "Total Doses", "Taken", "Skipped", "Missed", "Adherence Rate"]],
          body: [
            [
              'Today',
              userData.analytics.todayStats?.total?.toString() || '0',
              userData.analytics.todayStats?.taken?.toString() || '0',
              userData.analytics.todayStats?.skipped?.toString() || '0',
              userData.analytics.todayStats?.missed?.toString() || '0',
              `${userData.analytics.todayStats?.adherenceRate?.toFixed(1) || '0'}%`
            ],
            [
              'This Week',
              userData.analytics.weekStats?.total?.toString() || '0',
              userData.analytics.weekStats?.taken?.toString() || '0',
              userData.analytics.weekStats?.skipped?.toString() || '0',
              userData.analytics.weekStats?.missed?.toString() || '0',
              `${userData.analytics.weekStats?.adherenceRate?.toFixed(1) || '0'}%`
            ],
            [
              'This Month',
              userData.analytics.monthStats?.total?.toString() || '0',
              userData.analytics.monthStats?.taken?.toString() || '0',
              userData.analytics.monthStats?.skipped?.toString() || '0',
              userData.analytics.monthStats?.missed?.toString() || '0',
              `${userData.analytics.monthStats?.adherenceRate?.toFixed(1) || '0'}%`
            ]
          ],
          ...tableConfig
        });

        currentY = ((doc as any).lastAutoTable?.finalY ?? currentY + 20) + 10;

        // Performance Ranking
        doc.setFontSize(12);
        doc.text('Performance Ranking', 14, currentY);

        autoTable(doc, {
          startY: currentY + 4,
          theme: "grid",
          head: [["Metric", "Value"]],
          body: [
            ['Current Grade', userData.analytics.performanceRanking || '-'],
            ['Performance Text', userData.analytics.rankingText || '-'],
            ['Current Streak', `${userData.analytics.streakData?.current || 0} days`],
            ['Longest Streak', `${userData.analytics.streakData?.longest || 0} days`],
            ['This Month Streak', `${userData.analytics.streakData?.thisMonth || 0} days`]
          ],
          ...tableConfig
        });

        currentY = ((doc as any).lastAutoTable?.finalY ?? currentY + 20) + 10;

        // Medication Breakdown
        if (userData.analytics.medicationBreakdown && userData.analytics.medicationBreakdown.length > 0) {
          doc.setFontSize(12);
          doc.text('Medication Breakdown', 14, currentY);

          autoTable(doc, {
            startY: currentY + 4,
            theme: "striped",
            head: [["Medication", "Taken", "Total", "Adherence Rate"]],
            body: userData.analytics.medicationBreakdown.map((med: any) => [
              med.medication || 'Unknown',
              med.taken?.toString() || '0',
              med.total?.toString() || '0',
              `${med.adherenceRate?.toFixed(1) || '0'}%`
            ]),
            ...tableConfig
          });

          currentY = ((doc as any).lastAutoTable?.finalY ?? currentY + 20) + 15;
        }
      }

      // ========== ADHERENCE HISTORY SECTION ==========
      if (userData.adherence && userData.adherence.length > 0) {
        // Check if we need a new page
        if (currentY > 180) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(16);
        doc.text('Recent Adherence History', 14, currentY);

        // Show last 50 records to avoid too much data
        const recentAdherence = userData.adherence.slice(0, 50);

        autoTable(doc, {
          startY: currentY + 4,
          theme: "grid",
          head: [
            [
              'Scheduled Date/Time',
              'Medication',
              'Status',
              'Taken Time',
              'Notes',
              'Side Effects'
            ]
          ],
          body: recentAdherence.map((adh) => {
            // Find medication name from medications array
            const medication = userData.medications.find(med => med.id === adh.medication_id);

            return [
              formatDateTime(adh.scheduled_datetime),
              medication?.name || 'Unknown',
              adh.status || 'pending',
              adh.taken_time ? formatDateTime(adh.taken_time) : '-',
              adh.notes || '-',
              adh.side_effects_reported?.join(", ") || 'None'
            ];
          }),
          ...tableConfig,
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 30 },
            2: { cellWidth: 20 },
            3: { cellWidth: 35 },
            4: { cellWidth: 35 },
            5: { cellWidth: 35 }
          }
        });
      }

      // Footer
      const pageCount = (doc as any).internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount} - Generated on ${new Date().toLocaleString()}`,
          14,
          290
        );
      }

      // Save the PDF
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      const safeName = (userData.profile.name || "user").replace(/[^a-z0-9]/gi, "_");
      doc.save(`${safeName}_medical_data_${dateStr}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      Export PDF
    </button>
  );
};