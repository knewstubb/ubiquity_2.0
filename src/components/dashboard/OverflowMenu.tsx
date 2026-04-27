import { useState, useRef, useEffect } from 'react';
import styles from './OverflowMenu.module.css';

interface OverflowMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface OverflowMenuProps {
  items: OverflowMenuItem[];
}

export function OverflowMenu({ items }: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen((prev) => !prev);
  }

  function handleItemClick(e: React.MouseEvent, item: OverflowMenuItem) {
    e.stopPropagation();
    setOpen(false);
    item.onClick();
  }

  return (
    <div ref={menuRef} className={styles.container}>
      <button
        className={styles.trigger}
        onClick={handleToggle}
        aria-label="More actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="3" r="1.5" fill="currentColor" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="8" cy="13" r="1.5" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              className={`${styles.menuItem} ${item.danger ? styles.menuItemDanger : ''}`}
              role="menuitem"
              onClick={(e) => handleItemClick(e, item)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
