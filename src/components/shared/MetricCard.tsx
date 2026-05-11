interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
}

export function MetricCard({ label, value, subtitle }: MetricCardProps) {
  return (
    <div className="bg-background border border-border rounded-md shadow-sm px-6 py-5 flex flex-col gap-1">
      <p className="text-sm font-medium text-tertiary-foreground m-0">{label}</p>
      <p className="text-2xl font-semibold text-muted-foreground m-0">{value}</p>
      {subtitle && <p className="text-xs text-tertiary-foreground m-0">{subtitle}</p>}
    </div>
  );
}
