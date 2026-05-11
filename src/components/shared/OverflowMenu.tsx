import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

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
    <div ref={menuRef} className="relative inline-flex">
      <button
        className="inline-flex items-center justify-center w-7 h-7 border-none rounded-sm bg-transparent text-tertiary-foreground cursor-pointer transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
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
        <div className="absolute top-full right-0 z-10 min-w-[120px] bg-background-elevated border border-border rounded-md shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150" role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              className={cn(
                "block w-full px-3 py-2 border-none bg-transparent text-sm text-foreground text-left cursor-pointer transition-colors duration-150",
                "hover:bg-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px] focus-visible:bg-background",
                item.danger && "text-destructive hover:bg-destructive-subtle"
              )}
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
