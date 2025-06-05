import React, { createContext, useContext, useState, useCallback } from 'react'
import { AccessibilityContextType } from '../types/accessibility_types'

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string>('')
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite')
  const [skipToContent, setSkipToContent] = useState(false)

  const announceMessage = useCallback((newMessage: string, newPoliteness: 'polite' | 'assertive' = 'polite') => {
    setMessage(newMessage)
    setPoliteness(newPoliteness)
  }, [])

  return (
    <AccessibilityContext.Provider value={{ announceMessage, setSkipToContent }}>
      {children}
      <div
        role="status"
        aria-live={politeness}
        className="sr-only"
      >
        {message}
      </div>
      {skipToContent && (
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-white focus:text-blue-600"
        >
          Skip to main content
        </a>
      )}
    </AccessibilityContext.Provider>
  )
}

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
} 