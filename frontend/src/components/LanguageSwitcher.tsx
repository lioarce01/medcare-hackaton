import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { ChevronDown } from 'lucide-react';

interface Language {
  code: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', flag: '🇺🇸' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'cn', flag: '🇨🇳' },
  // Add more languages here as needed
  // { code: 'fr', flag: '🇫🇷' },
  // { code: 'de', flag: '🇩🇪' },
  // { code: 'pt', flag: '🇵🇹' },
];

export const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguageFlag = LANGUAGES.find(lang => lang.code === currentLanguage)?.flag || '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
      >
        <span>{currentLanguageFlag} {currentLanguage.toUpperCase()}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-20 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  changeLanguage(language.code);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 ${
                  currentLanguage === language.code 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-600'
                }`}
              >
                {language.flag} {language.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 