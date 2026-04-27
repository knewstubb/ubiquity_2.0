import { Link } from 'react-router-dom';
import styles from './BreadcrumbBar.module.css';

interface BreadcrumbBarProps {
  items: { label: string; to?: string }[];
}

export function BreadcrumbBar({ items }: BreadcrumbBarProps) {
  return (
    <nav className={styles.bar} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index}>
            {index > 0 && <span className={styles.separator} aria-hidden="true">{' > '}</span>}
            {item.to && !isLast ? (
              <Link className={styles.link} to={item.to}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.current} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
