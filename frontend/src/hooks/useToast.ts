import { useContext } from "react";
import { ToastContext } from "../components/Toast";

type ToastType = "success" | "error" | "info" | "warning";

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
