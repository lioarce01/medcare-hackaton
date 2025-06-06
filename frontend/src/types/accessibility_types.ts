export interface AccessibilityContextType {
  announceMessage: (
    message: string,
    politeness?: "polite" | "assertive"
  ) => void;
  setSkipToContent: (enabled: boolean) => void;
}
