import styles from './ProtocolIcon.module.css';

interface ProtocolIconProps {
  protocol: 'S3' | 'SFTP' | 'Azure Blob';
  size?: number;
  className?: string;
}

export function ProtocolIcon({ protocol, size = 24, className = '' }: ProtocolIconProps) {
  return (
    <span
      className={`${styles.icon} ${className}`}
      role="img"
      aria-label={protocol === 'S3' ? 'S3 bucket' : protocol === 'Azure Blob' ? 'Azure Blob storage' : 'SFTP server'}
    >
      {protocol === 'S3' ? (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="currentColor"/>
          <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : protocol === 'Azure Blob' ? (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2.5" y="2.5" width="8" height="8" rx="1.5" fill="currentColor"/>
          <rect x="13.5" y="2.5" width="8" height="8" rx="1.5" fill="currentColor"/>
          <rect x="2.5" y="13.5" width="8" height="8" rx="1.5" fill="currentColor"/>
          <rect x="13.5" y="13.5" width="8" height="8" rx="1.5" fill="currentColor"/>
        </svg>
      ) : (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="currentColor"/>
        </svg>
      )}
    </span>
  );
}
