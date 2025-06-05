import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

const LANGUAGE_KEY = "medcare_language";

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback(
    (language: string) => {
      i18n.changeLanguage(language);
      localStorage.setItem(LANGUAGE_KEY, language);
    },
    [i18n]
  );

  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  return {
    currentLanguage: i18n.language,
    changeLanguage,
  };
};
