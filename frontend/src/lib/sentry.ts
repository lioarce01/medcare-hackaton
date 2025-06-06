import * as Sentry from "@sentry/react";
import { browserTracingIntegration } from "@sentry/react";

export const initSentry = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [browserTracingIntegration()],
      tracesSampleRate: 1.0,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION,
      beforeSend(event) {
        // Don't send events in development
        if (import.meta.env.DEV) {
          return null;
        }
        return event;
      },
    });
  }
};

export const SentryErrorBoundary = Sentry.ErrorBoundary;
