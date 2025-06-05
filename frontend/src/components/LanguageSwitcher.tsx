import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { ChevronDown, Globe } from 'lucide-react';

interface Language {
  code: string;
  flag: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', flag: '🇺🇸', name: 'English', nativeName: 'English' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
  { code: 'cn', flag: '🇨🇳', name: 'Chinese', nativeName: '中文' },
  { code: 'pt', flag: '🇧🇷', name: 'Portuguese', nativeName: 'Português' }
];

export const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage: currentLangCode, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLanguage = LANGUAGES.find(lang => lang.code === currentLangCode);

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
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('language.switcher.label', 'Select language')}
      >
        <Globe size={16} className="text-gray-500" />
        <span className="flex items-center">
          <span className="mr-2">{selectedLanguage?.flag}</span>
          <span className="hidden sm:inline">{selectedLanguage?.nativeName}</span>
        </span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu"
        >
          <div className="py-1" role="none">
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  changeLanguage(language.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center ${
                  currentLangCode === language.code 
                    ? 'text-blue-600 font-medium bg-blue-50' 
                    : 'text-gray-700'
                }`}
                role="menuitem"
                aria-current={currentLangCode === language.code ? 'true' : undefined}
              >
                <span className="mr-2">{language.flag}</span>
                <span className="flex-1">{language.nativeName}</span>
                {currentLangCode === language.code && (
                  <span className="text-blue-600" aria-hidden="true">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 