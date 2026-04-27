import { useState, useRef, useEffect, useCallback } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';
import { useRoleSimulator } from '../../contexts/RoleSimulatorContext';
import type { SimulatedRole } from '../../lib/session-store';
import styles from './RoleSimulator.module.css';

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
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Role: ${activeLabel}`}
      >
        <span className={styles.label}>Role</span>
        <span className={styles.roleName}>{activeLabel}</span>
        <span className={`${styles.caret} ${isOpen ? styles.caretOpen : ''}`}>
          <CaretDown size={10} weight="bold" />
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox" aria-label="Select role">
          {ROLES.map((role) => {
            const isActive = role.value === activeRole;
            return (
              <button
                key={role.value}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`${styles.option} ${isActive ? styles.optionActive : ''}`}
                onClick={() => handleSelect(role.value)}
              >
                {role.label}
                {isActive && (
                  <span className={styles.checkmark}>
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
