import React, { createContext, useContext, useState, useCallback } from 'react'
import { ToastProps, ToastContextType } from '../types/ui_types'
import { X } from 'lucide-react'

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastProps | null>(null)

  const showToast = useCallback((message: string, type: ToastProps['type'], duration = 3000) => {
    setToast({ message, type, duration })
    setTimeout(() => setToast(null), duration)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : toast.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : toast.type === 'warning'
                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-white/50 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastContainer: React.FC = () => null