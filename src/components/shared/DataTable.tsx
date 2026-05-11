import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({ columns, data, emptyMessage = 'No data to display', onRowClick }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="border border-border rounded-md shadow-sm overflow-auto bg-background">
        <p className="text-center text-tertiary-foreground py-10 text-base">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md shadow-sm overflow-auto bg-background">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="sticky top-0 bg-background text-left px-4 py-3 font-semibold text-muted-foreground border-b border-border whitespace-nowrap"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className={cn(
                "even:bg-background [&:last-child>td]:border-b-0",
                onRowClick && "cursor-pointer transition-colors duration-150 hover:bg-secondary"
              )}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-muted-foreground border-b border-border">
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
