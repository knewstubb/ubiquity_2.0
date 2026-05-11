import { Link } from 'react-router-dom';

interface BreadcrumbBarProps {
  items: { label: string; to?: string }[];
}

export function BreadcrumbBar({ items }: BreadcrumbBarProps) {
  return (
    <nav className="flex items-center gap-2 text-sm leading-normal" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index}>
            {index > 0 && <span className="text-tertiary-foreground select-none" aria-hidden="true">{' > '}</span>}
            {item.to && !isLast ? (
              <Link
                className="text-primary font-medium no-underline transition-colors duration-150 hover:text-accent-hover hover:underline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:rounded-sm"
                to={item.to}
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium" aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
