import { ReactNode } from "react";

export interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

export interface ToastContextType {
  showToast: (
    message: string,
    type: ToastProps["type"],
    duration?: number
  ) => void;
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  placeholder?: string;
}

export interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export interface AdherenceSummaryProps {
  adherenceRate: number;
  totalDoses: number;
  takenDoses: number;
  streakDays: number;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface ExportUserDataPDFProps {
  userData: {
    profile: any;
    medications: any[];
    adherence: any[];
    analytics?: {
      overall?: {
        total?: number;
        taken?: number;
        skipped?: number;
        adherenceRate?: number;
      };
    };
  };
}
