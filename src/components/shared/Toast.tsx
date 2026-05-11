import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = `toast-${++counterRef.current}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 5000);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2 pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-2.5 px-4 py-3 rounded-[4px] font-sans text-sm leading-[17px] text-foreground bg-background border border-border shadow-md pointer-events-auto min-w-[280px] max-w-[420px] animate-[slideIn_0.2s_ease-out]',
              toast.type === 'success' && 'border-l-[3px] border-l-primary',
              toast.type === 'error' && 'border-l-[3px] border-l-destructive',
              toast.type === 'info' && 'border-l-[3px] border-l-info',
              toast.type === 'warning' && 'border-l-[3px] border-l-warning',
            )}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              className="bg-transparent border-none cursor-pointer text-tertiary-foreground text-base px-0.5 py-0 leading-none hover:text-muted-foreground"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
