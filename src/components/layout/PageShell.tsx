import type { ReactNode } from 'react';

interface PageShellProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, subtitle, action, children }: PageShellProps) {
  return (
    <div className="w-full max-w-[1440px] mx-auto min-h-[calc(100vh-85px)] py-7 px-6 bg-background">
      <div className="flex items-center justify-between mb-7">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground m-0">{title}</h1>
          {subtitle && <p className="text-sm text-tertiary-foreground m-0">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
