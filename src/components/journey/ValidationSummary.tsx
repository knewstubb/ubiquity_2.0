import {
  WarningCircle,
  Warning,
  CheckCircle,
  X,
} from '@phosphor-icons/react';
import type { ValidationError } from '../../utils/journeyValidation';

export interface ValidationSummaryProps {
  errors: ValidationError[];
  onSelectNode: (nodeId: string) => void;
  onClose: () => void;
}

export function ValidationSummary({
  errors,
  onSelectNode,
  onClose,
}: ValidationSummaryProps) {
  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;

  return (
    <div
      className="absolute top-12 right-4 w-[360px] max-h-[400px] bg-background border border-border rounded-sm shadow-lg font-sans z-50 flex flex-col overflow-hidden"
      role="region"
      aria-label="Validation summary"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-foreground">Validation</span>
          {errorCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-primary-foreground text-[11px] font-bold leading-none">
              {errorCount}
            </span>
          )}
          {warningCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-amber-500 text-primary-foreground text-[11px] font-bold leading-none">
              {warningCount}
            </span>
          )}
        </div>
        <button
          className="flex items-center justify-center w-7 h-7 border-none bg-transparent text-muted-foreground cursor-pointer rounded-sm transition-colors duration-150 hover:bg-secondary"
          onClick={onClose}
          title="Close validation summary"
          aria-label="Close validation summary"
        >
          <X size={16} weight="bold" />
        </button>
      </div>

      {/* Success state */}
      {errors.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-4 py-6">
          <CheckCircle
            size={32}
            weight="fill"
            className="text-primary"
          />
          <span className="text-sm font-medium text-foreground">Journey is valid</span>
          <span className="text-xs text-muted-foreground">
            No errors or warnings found
          </span>
        </div>
      )}

      {/* Error list */}
      {errors.length > 0 && (
        <ul className="list-none m-0 p-0 overflow-y-auto flex-1">
          {errors.map((error, index) => (
            <li
              key={`${error.nodeId ?? 'journey'}-${index}`}
              className="flex items-start gap-2 px-4 py-2 border-b border-border last:border-b-0 cursor-pointer transition-colors duration-150 hover:bg-secondary"
              onClick={() => error.nodeId && onSelectNode(error.nodeId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (error.nodeId) onSelectNode(error.nodeId);
                }
              }}
              aria-label={`${error.severity}: ${error.message}`}
            >
              <span className="shrink-0 mt-px">
                {error.severity === 'error' ? (
                  <WarningCircle
                    size={16}
                    weight="fill"
                    className="text-red-500"
                  />
                ) : (
                  <Warning
                    size={16}
                    weight="fill"
                    className="text-amber-500"
                  />
                )}
              </span>
              <span className="text-xs text-foreground leading-normal">{error.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
