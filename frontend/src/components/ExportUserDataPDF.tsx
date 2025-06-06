import React from 'react'
import { ExportUserDataPDFProps } from '../types/ui_types'
import { jsPDF } from 'jspdf';
import autoTable from "jspdf-autotable";
import { useTranslation } from 'react-i18next';

export const ExportUserDataPDF: React.FC<ExportUserDataPDFProps> = ({ userData }) => {
  const { t, i18n } = useTranslation();

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

      // Set font based on language
      const isChinese = i18n.language === 'cn';
      
      // For Chinese language, use English translations
      const t2 = isChinese ? (key: string, options?: any): string => {
        // Force English translations for Chinese language
        return t(key, { ...options, lng: 'en' }) as string;
      } : t;

      // Use helvetica font for all languages
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);

      // Title
      doc.setFontSize(22);
      doc.text(t2('profile.sections.privacy.export.title', { name: userData.profile.name }), 14, 18);

      // Profile Section
      doc.setFontSize(16);
      doc.text(t2('profile.sections.privacy.export.sections.profile'), 14, 30);
      doc.setFontSize(12);

      // Configure autoTable
      const tableConfig = {
        styles: { 
          fontSize: 10,
          cellPadding: 3,
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

      // Profile Table
      autoTable(doc, {
        startY: 34,
        theme: "grid",
        head: [["Field", "Value"]],
        body: [
          [t2('profile.sections.privacy.export.fields.name'), userData.profile.name],
          [t2('profile.sections.privacy.export.fields.email'), userData.profile.email],
          [t2('profile.sections.privacy.export.fields.date_of_birth'), userData.profile.date_of_birth],
          [t2('profile.sections.privacy.export.fields.gender'), userData.profile.gender],
          [t2('profile.sections.privacy.export.fields.phone'), userData.profile.phone_number],
          [t2('profile.sections.privacy.export.fields.allergies'), userData.profile.allergies?.join(", ") || "-"],
          [t2('profile.sections.privacy.export.fields.conditions'), userData.profile.conditions?.join(", ") || "-"],
          [t2('profile.sections.privacy.export.fields.reminder_times'), userData.profile.preferred_reminder_time?.join(", ") || "-"],
          [t2('profile.sections.privacy.export.fields.email_notifications'), userData.profile.email_notifications_enabled ? t2('common.enabled') : t2('common.disabled')],
          [t2('profile.sections.privacy.export.fields.emergency_contact.name'), userData.profile.emergency_contact?.name || "-"],
          [t2('profile.sections.privacy.export.fields.emergency_contact.relationship'), userData.profile.emergency_contact?.relationship || "-"],
          [t2('profile.sections.privacy.export.fields.emergency_contact.phone'), userData.profile.emergency_contact?.phone_number || "-"],
        ],
        ...tableConfig
      });

      let y = ((doc as any).lastAutoTable?.finalY ?? 44) + 10;

      // Medications Section
      if (userData.medications && userData.medications.length > 0) {
        doc.setFontSize(16);
        doc.text(t2('profile.sections.privacy.export.sections.medications'), 14, y);
        doc.setFontSize(12);
        autoTable(doc, {
          startY: y + 4,
          theme: "striped",
          head: [
            [
              t2('profile.sections.privacy.export.medications.name'),
              t2('profile.sections.privacy.export.medications.dosage'),
              t2('profile.sections.privacy.export.medications.type'),
              t2('profile.sections.privacy.export.medications.frequency'),
              t2('profile.sections.privacy.export.medications.active')
            ]
          ],
          body: userData.medications.map((m) => [
            m.name,
            `${m.dosage?.amount} ${m.dosage?.unit}`,
            m.medication_type,
            m.frequency?.times_per_day
              ? `${m.frequency.times_per_day}x/day`
              : m.frequency,
            m.active ? t2('common.yes') : t2('common.no'),
          ]),
          ...tableConfig
        });

        y = ((doc as any).lastAutoTable?.finalY ?? y + 14) + 10;
      }

      // Adherence Section
      if (userData.adherence && userData.adherence.length > 0) {
        doc.setFontSize(16);
        doc.text(t2('profile.sections.privacy.export.sections.adherence'), 14, y);
        doc.setFontSize(12);
        autoTable(doc, {
          startY: y + 4,
          theme: "grid",
          head: [
            [
              t2('profile.sections.privacy.export.adherence.date'),
              t2('profile.sections.privacy.export.adherence.medication'),
              t2('profile.sections.privacy.export.adherence.scheduled_time'),
              t2('profile.sections.privacy.export.adherence.status'),
              t2('profile.sections.privacy.export.adherence.taken_time')
            ]
          ],
          body: userData.adherence.map((a) => [
            a.scheduled_date,
            a.medication?.name || "",
            a.scheduled_time,
            a.status,
            a.taken_time || "-",
          ]),
          ...tableConfig
        });

        y = ((doc as any).lastAutoTable?.finalY ?? y + 14) + 10;
      }

      // Analytics Section
      if (userData.analytics) {
        doc.setFontSize(16);
        doc.text(t2('profile.sections.privacy.export.sections.analytics'), 14, y);
        doc.setFontSize(12);
        autoTable(doc, {
          startY: y + 4,
          theme: "grid",
          head: [["Metric", "Value"]],
          body: [
            [t2('profile.sections.privacy.export.analytics.total_doses'), userData.analytics?.overall?.total ?? "-"],
            [t2('profile.sections.privacy.export.analytics.taken'), userData.analytics?.overall?.taken ?? "-"],
            [t2('profile.sections.privacy.export.analytics.skipped'), userData.analytics?.overall?.skipped ?? "-"],
            [t2('profile.sections.privacy.export.analytics.adherence_rate'), userData.analytics?.overall?.adherenceRate?.toFixed(2) ?? "-"],
          ],
          ...tableConfig
        });
      }

      // Save the PDF with user name and date
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      const safeName = (userData.profile.name || "user").replace(/[^a-z0-9]/gi, "_");
      doc.save(`${safeName}_${dateStr}.pdf`);
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
      {t('profile.sections.privacy.export.button')}
    </button>
  );
};
