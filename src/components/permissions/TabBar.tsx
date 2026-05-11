import { cn } from '../../lib/utils';

interface Tab {
  key: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeKey: string;
  onTabChange: (key: string) => void;
}

export function TabBar({ tabs, activeKey, onTabChange }: TabBarProps) {
  return (
    <div className="flex gap-0 border-b border-border" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={tab.key === activeKey}
          className={cn(
            "relative px-4 py-2 font-sans text-sm font-semibold leading-tight text-foreground",
            "bg-transparent border-none border-b-2 border-transparent cursor-pointer",
            "transition-colors duration-150 whitespace-nowrap",
            "hover:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px] focus-visible:rounded-sm",
            tab.key === activeKey && "text-primary border-b-primary"
          )}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
