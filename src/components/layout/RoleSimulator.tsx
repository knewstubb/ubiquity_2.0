import { useState, useRef, useEffect, useCallback } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';
import { useRoleSimulator } from '../../contexts/RoleSimulatorContext';
import type { SimulatedRole } from '../../lib/session-store';
import { cn } from '../../lib/utils';

const ROLES: { value: SimulatedRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'marketer', label: 'Marketer' },
  { value: 'viewer', label: 'Viewer' },
];

export function RoleSimulator() {
  const { activeRole, setRole } = useRoleSimulator();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const activeLabel = ROLES.find((r) => r.value === activeRole)?.label ?? 'Admin';

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (role: SimulatedRole) => {
      setRole(role);
      setIsOpen(false);
    },
    [setRole],
  );

  return (
    <div className="relative flex items-center shrink-0" ref={wrapperRef}>
      <button
        type="button"
        className="flex items-center gap-1.5 px-2.5 py-1 h-7 bg-secondary border border-border rounded-md cursor-pointer font-sans text-xs font-semibold text-muted-foreground whitespace-nowrap transition-colors duration-150 hover:bg-background-sunken hover:border-border-strong focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Role: ${activeLabel}`}
      >
        <span className="text-[10px] font-medium text-tertiary-foreground uppercase tracking-[0.04em]">Role</span>
        <span className="text-primary font-bold">{activeLabel}</span>
        <span className={cn("flex items-center text-tertiary-foreground transition-transform duration-150", isOpen && "rotate-180")}>
          <CaretDown size={10} weight="bold" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] right-0 min-w-[140px] bg-background border border-border rounded-lg shadow-[0px_4px_12px_rgba(0,0,0,0.08)] p-1 z-[100]" role="listbox" aria-label="Select role">
          {ROLES.map((role) => {
            const isActive = role.value === activeRole;
            return (
              <button
                key={role.value}
                type="button"
                role="option"
                aria-selected={isActive}
                className={cn(
                  "flex items-center justify-between w-full px-2.5 py-1.5 font-sans text-[13px] font-medium text-foreground",
                  "bg-none border-none rounded cursor-pointer text-left transition-colors duration-150 hover:bg-secondary",
                  isActive && "text-primary font-semibold"
                )}
                onClick={() => handleSelect(role.value)}
              >
                {role.label}
                {isActive && (
                  <span className="text-primary shrink-0">
                    <Check size={14} weight="bold" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
