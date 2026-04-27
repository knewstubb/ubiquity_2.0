import { useState, useEffect, useCallback } from 'react';
import type { Connection } from '../../models/connection';
import styles from './CreateConnectionModal.module.css';

type ConnectionType = 'aws-s3' | 'azure-blob' | 'sftp';
type SftpAuthMethod = 'password' | 'ssh-key';
type AwsAuthMethod = 'access-key' | 'iam-role';
type TestStatus = 'idle' | 'testing' | 'success';

interface CreateConnectionModalProps {
  onClose: () => void;
  onCreate: (connection: Connection) => void;
}

export function CreateConnectionModal({ onClose, onCreate }: CreateConnectionModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [name, setName] = useState('');
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(null);
  const [basePath, setBasePath] = useState('');

  // Step 2 — AWS S3
  const [awsRegion, setAwsRegion] = useState('');
  const [bucketName, setBucketName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [awsAuthMethod, setAwsAuthMethod] = useState<AwsAuthMethod>('access-key');
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [awsAccountId, setAwsAccountId] = useState('');
  const [iamRoleArn, setIamRoleArn] = useState('');

  // Step 2 — Azure Blob
  const [containerName, setContainerName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [sasToken, setSasToken] = useState('');

  // Step 2 — SFTP
  const [hostname, setHostname] = useState('');
  const [port, setPort] = useState('22');
  const [sftpUsername, setSftpUsername] = useState('');
  const [sftpAuthMethod, setSftpAuthMethod] = useState<SftpAuthMethod>('password');
  const [sftpPassword, setSftpPassword] = useState('');
  const [sshKey, setSshKey] = useState('');

  // Test connection
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');

  const canProceedStep1 = name.trim().length > 0 && connectionType !== null;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleNext() {
    if (canProceedStep1) setStep(2);
  }

  function handleBack() {
    setStep(1);
    setTestStatus('idle');
  }

  function handleTestConnection() {
    setTestStatus('testing');
    setTimeout(() => setTestStatus('success'), 1500);
  }

  function handleCreate() {
    if (!connectionType) return;

    const protocol = connectionType === 'aws-s3' ? 'S3' as const
      : connectionType === 'azure-blob' ? 'Azure Blob' as const
      : 'SFTP' as const;

    const config = connectionType === 'aws-s3'
      ? { region: awsRegion, bucket: bucketName, prefix: prefix }
      : connectionType === 'azure-blob'
      ? { containerName, accountName }
      : { host: hostname, port: parseInt(port) || 22, path: basePath };

    const connection: Connection = {
      id: crypto.randomUUID(),
      name: name.trim(),
      protocol,
      status: 'connected',
      basePath: basePath || '/company/base-path/',
      config,
    };

    onCreate(connection);
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}
      role="dialog" aria-modal="true" aria-labelledby="create-conn-title">
      <div className={styles.dialog}>
        {/* Title bar */}
        <div className={styles.titleBar}>
          <h2 id="create-conn-title" className={styles.title}>Create Connection</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {step === 1 ? renderStep1() : renderStep2()}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {step === 2 && (
            <button type="button" className={styles.backButton} onClick={handleBack}>Back</button>
          )}
          <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
          {step === 1 ? (
            <button type="button" className={styles.primaryButton} disabled={!canProceedStep1} onClick={handleNext}>
              Next
            </button>
          ) : (
            <button type="button" className={styles.primaryButton} onClick={handleCreate}>
              Create Connection
            </button>
          )}
        </div>
      </div>
    </div>
  );

  /* ── Step 1: Name + Type ── */
  function renderStep1() {
    return (
      <>
        <div className={styles.section}>
          <label className={styles.sectionLabel} htmlFor="conn-name-input">Connection Name</label>
          <input
            id="conn-name-input"
            className={styles.textInput}
            type="text"
            placeholder="Enter connection name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Connection Type</span>
          <div className={styles.typeCards}>
            {/* AWS S3 */}
            <button type="button"
              className={`${styles.typeCard} ${connectionType === 'aws-s3' ? styles.typeCardActive : ''}`}
              onClick={() => setConnectionType('aws-s3')}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M6 22l10 4 10-4V10L16 6 6 10v12z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M6 10l10 4 10-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M16 14v12" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className={styles.typeCardLabel}>AWS S3</span>
            </button>

            {/* Azure Blob */}
            <button type="button"
              className={`${styles.typeCard} ${connectionType === 'azure-blob' ? styles.typeCardActive : ''}`}
              onClick={() => setConnectionType('azure-blob')}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect x="5" y="5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                <rect x="18" y="5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                <rect x="5" y="18" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                <rect x="18" y="18" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className={styles.typeCardLabel}>AZURE BLOB</span>
            </button>

            {/* SFTP */}
            <button type="button"
              className={`${styles.typeCard} ${connectionType === 'sftp' ? styles.typeCardActive : ''}`}
              onClick={() => setConnectionType('sftp')}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M4 8a2 2 0 012-2h8l2 3h12a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <span className={styles.typeCardLabel}>SFTP</span>
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel} htmlFor="conn-base-path">Base Path</label>
          <input
            id="conn-base-path"
            className={styles.textInput}
            type="text"
            placeholder="/company/inbound/"
            value={basePath}
            onChange={(e) => setBasePath(e.target.value)}
          />
          <p className={styles.hint}>The root folder on the remote system where files are read from or written to</p>
        </div>
      </>
    );
  }

  /* ── Step 2: Type-specific settings ── */
  function renderStep2() {
    if (connectionType === 'aws-s3') return renderAwsS3();
    if (connectionType === 'azure-blob') return renderAzureBlob();
    return renderSftp();
  }

  /* ── AWS S3 ── */
  function renderAwsS3() {
    return (
      <>
        <h3 className={styles.sectionHeading}>Connection Settings</h3>

        <div className={styles.section}>
          <label className={styles.sectionLabel} htmlFor="aws-region">AWS Region</label>
          <select id="aws-region" className={styles.select} value={awsRegion} onChange={(e) => setAwsRegion(e.target.value)}>
            <option value="">Select Region</option>
            <option value="us-east-1">us-east-1</option>
            <option value="us-west-2">us-west-2</option>
            <option value="eu-west-1">eu-west-1</option>
            <option value="ap-southeast-2">ap-southeast-2</option>
          </select>
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel} htmlFor="bucket-name">Bucket Name</label>
          <input id="bucket-name" className={styles.textInput} type="text" placeholder="Add bucket" value={bucketName} onChange={(e) => setBucketName(e.target.value)} />
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel} htmlFor="s3-prefix">Prefix (optional)</label>
          <input id="s3-prefix" className={styles.textInput} type="text" placeholder="Add prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
        </div>

        <h3 className={styles.sectionHeading}>Authentication</h3>

        <div className={styles.section}>
          <label className={styles.sectionLabel} htmlFor="aws-auth-method">Authentication Method</label>
          <select id="aws-auth-method" className={styles.select} value={awsAuthMethod} onChange={(e) => setAwsAuthMethod(e.target.value as AwsAuthMethod)}>
            <option value="access-key">Access Key</option>
            <option value="iam-role">IAM Role</option>
          </select>
        </div>

        {awsAuthMethod === 'access-key' ? (
          <>
            <div className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="access-key-id">Access Key ID</label>
              <input id="access-key-id" className={styles.textInput} type="text" value={accessKeyId} onChange={(e) => setAccessKeyId(e.target.value)} />
            </div>
            <div className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="secret-access-key">Secret Access Key</label>
              <input id="secret-access-key" className={styles.textInput} type="password" value={secretAccessKey} onChange={(e) => setSecretAccessKey(e.target.value)} />
              <p className={styles.hint}>Ensure you keep your credentials up to date to avoid this importer failing</p>
            </div>
          </>
        ) : (
          <>
            <div className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="aws-account-id">AWS Account ID</label>
              <input id="aws-account-id" className={styles.textInput} type="text" value={awsAccountId} onChange={(e) => setAwsAccountId(e.target.value)} />
            </div>
            <div className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="iam-role-arn">IAM Role ARN</label>
              <input id="iam-role-arn" className={styles.textInput} type="text" value={iamRoleArn} onChange={(e) => setIamRoleArn(e.target.value)} />
            </div>
          </>
        )}

        {renderTestConnectionRow()}
      </>
    );
  }

  /* ── Azure Blob ── */
  function renderAzureBlob() {
    return (
      <>
        <h3 className={styles.sectionHeading}>Connection Settings</h3>

        <div className={styles.section}>
          <label className={styles.sectionLabel} htmlFor="container-name">Container Name</label>
          <input id="container-name" className={styles.textInput} type="text" value={containerName} onChange={(e) => setContainerName(e.target.value)} />
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel} htmlFor="account-name">Account Name</label>
          <input id="account-name" className={styles.textInput} type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
        </div>

        <h3 className={styles.sectionHeading}>Authentication</h3>

        <div className={styles.section}>
          <label className={styles.sectionLabel} htmlFor="sas-token">SAS Token</label>
          <input id="sas-token" className={styles.textInput} type="text" value={sasToken} onChange={(e) => setSasToken(e.target.value)} />
        </div>

        {renderTestConnectionRow()}
      </>
    );
  }

  /* ── SFTP ── */
  function renderSftp() {
    return (
      <>
        <h3 className={styles.sectionHeading}>Connection Settings</h3>

        <div className={styles.section}>
          <label className={styles.sectionLabel} htmlFor="sftp-hostname">Hostname</label>
          <input id="sftp-hostname" className={styles.textInput} type="text" value={hostname} onChange={(e) => setHostname(e.target.value)} />
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel} htmlFor="sftp-port">Port</label>
          <input id="sftp-port" className={styles.textInput} type="text" value={port} onChange={(e) => setPort(e.target.value)} />
        </div>

        <h3 className={styles.sectionHeading}>Authentication</h3>

        <div className={styles.section}>
          <label className={styles.sectionLabel} htmlFor="sftp-username">Username</label>
          <input id="sftp-username" className={styles.textInput} type="text" value={sftpUsername} onChange={(e) => setSftpUsername(e.target.value)} />
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Auth Method</span>
          <div className={styles.authToggle}>
            <button type="button"
              className={`${styles.authToggleButton} ${sftpAuthMethod === 'password' ? styles.authToggleButtonActive : ''}`}
              onClick={() => setSftpAuthMethod('password')}>
              Password
            </button>
            <button type="button"
              className={`${styles.authToggleButton} ${sftpAuthMethod === 'ssh-key' ? styles.authToggleButtonActive : ''}`}
              onClick={() => setSftpAuthMethod('ssh-key')}>
              SSH Key
            </button>
          </div>
        </div>

        {sftpAuthMethod === 'password' ? (
          <div className={styles.section}>
            <label className={styles.sectionLabel} htmlFor="sftp-password">Password</label>
            <input id="sftp-password" className={styles.textInput} type="password" value={sftpPassword} onChange={(e) => setSftpPassword(e.target.value)} />
          </div>
        ) : (
          <div className={styles.section}>
            <label className={styles.sectionLabel} htmlFor="sftp-ssh-key">Public SSH Key</label>
            <textarea id="sftp-ssh-key" className={styles.textarea} value={sshKey} onChange={(e) => setSshKey(e.target.value)} />
          </div>
        )}

        {renderTestConnectionRow()}
      </>
    );
  }

  /* ── Test Connection row ── */
  function renderTestConnectionRow() {
    return (
      <div className={styles.testRow}>
        {testStatus === 'success' ? (
          <span className={styles.testSuccess}>Connected ✓</span>
        ) : (
          <>
            <span className={styles.testHint}>Ensure your settings are correct</span>
            <button type="button" className={styles.testButton} onClick={handleTestConnection} disabled={testStatus === 'testing'}>
              {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
          </>
        )}
      </div>
    );
  }
}
