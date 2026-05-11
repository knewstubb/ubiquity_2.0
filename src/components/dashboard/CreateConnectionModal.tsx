import { useState, useCallback } from 'react';
import { CheckCircle } from '@phosphor-icons/react';
import type { Connection } from '../../models/connection';
import { useAccount } from '../../contexts/AccountContext';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CardSelector } from '@/components/composed/card-selector';
import { ModalHeader } from '@/components/composed/modal-header';
import { ModalFooter } from '@/components/composed/modal-footer';

type ConnectionType = 'aws-s3' | 'azure-blob' | 'sftp';
type SftpAuthMethod = 'password' | 'ssh-key';
type AwsAuthMethod = 'access-key' | 'iam-role';
type TestStatus = 'idle' | 'testing' | 'success';

interface CreateConnectionModalProps {
  onClose: () => void;
  onCreate: (connection: Connection) => void;
  editConnection?: Connection;
}

export function CreateConnectionModal({ onClose, onCreate, editConnection }: CreateConnectionModalProps) {
  const isEditing = !!editConnection;
  const { selectedAccountId } = useAccount();
  const [step, setStep] = useState<1 | 2>(isEditing ? 2 : 1);

  // Step 1 state
  const [name, setName] = useState(editConnection?.name ?? '');
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(
    editConnection ? (editConnection.protocol === 'S3' ? 'aws-s3' : editConnection.protocol === 'Azure Blob' ? 'azure-blob' : 'sftp') : null,
  );
  const [basePath, setBasePath] = useState(editConnection?.basePath ?? '');

  // Step 2 — AWS S3
  const s3Config = editConnection?.protocol === 'S3' ? editConnection.config as { region: string; bucket: string; prefix: string; accessKeyId?: string; secretAccessKey?: string } : null;
  const [awsRegion, setAwsRegion] = useState(s3Config?.region ?? '');
  const [bucketName, setBucketName] = useState(s3Config?.bucket ?? '');
  const [prefix, setPrefix] = useState(s3Config?.prefix ?? '');
  const [awsAuthMethod, setAwsAuthMethod] = useState<AwsAuthMethod>('access-key');
  const [accessKeyId, setAccessKeyId] = useState(s3Config?.accessKeyId ?? '');
  const [secretAccessKey, setSecretAccessKey] = useState(s3Config?.secretAccessKey ?? '');
  const [awsAccountId, setAwsAccountId] = useState('');
  const [iamRoleArn, setIamRoleArn] = useState('');

  // Step 2 — Azure Blob
  const blobConfig = editConnection?.protocol === 'Azure Blob' ? editConnection.config as { containerName: string; accountName: string; sasToken?: string } : null;
  const [containerName, setContainerName] = useState(blobConfig?.containerName ?? '');
  const [accountName, setAccountName] = useState(blobConfig?.accountName ?? '');
  const [sasToken, setSasToken] = useState(blobConfig?.sasToken ?? '');

  // Step 2 — SFTP
  const sftpConfig = editConnection?.protocol === 'SFTP' ? editConnection.config as { host: string; port: number; path: string; username?: string; password?: string } : null;
  const [hostname, setHostname] = useState(sftpConfig?.host ?? '');
  const [port, setPort] = useState(sftpConfig?.port?.toString() ?? '22');
  const [sftpUsername, setSftpUsername] = useState(sftpConfig?.username ?? '');
  const [sftpAuthMethod, setSftpAuthMethod] = useState<SftpAuthMethod>('password');
  const [sftpPassword, setSftpPassword] = useState(sftpConfig?.password ?? '');
  const [sshKey, setSshKey] = useState('');

  // Test connection
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const testPassed = testStatus === 'success';

  // Track whether connection-affecting fields have changed (for edit mode)
  const hasConnectionChanged = isEditing ? (
    (connectionType === 'aws-s3' && (
      awsRegion !== (s3Config?.region ?? '') ||
      bucketName !== (s3Config?.bucket ?? '') ||
      prefix !== (s3Config?.prefix ?? '') ||
      accessKeyId !== (s3Config?.accessKeyId ?? '') ||
      secretAccessKey !== (s3Config?.secretAccessKey ?? '')
    )) ||
    (connectionType === 'sftp' && (
      hostname !== (sftpConfig?.host ?? '') ||
      port !== (sftpConfig?.port?.toString() ?? '22') ||
      sftpUsername !== (sftpConfig?.username ?? '') ||
      sftpPassword !== (sftpConfig?.password ?? '')
    )) ||
    (connectionType === 'azure-blob' && (
      containerName !== (blobConfig?.containerName ?? '') ||
      accountName !== (blobConfig?.accountName ?? '') ||
      sasToken !== (blobConfig?.sasToken ?? '')
    ))
  ) : true;

  const canProceedStep1 = connectionType !== null;

  const handleNext = useCallback(() => {
    if (canProceedStep1) setStep(2);
  }, [canProceedStep1]);

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
      id: editConnection?.id ?? crypto.randomUUID(),
      name: name.trim(),
      protocol,
      status: editConnection?.status ?? 'connected',
      basePath: basePath || '/company/base-path/',
      accountId: editConnection?.accountId ?? selectedAccountId,
      config,
    };

    onCreate(connection);
  }

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[560px] p-0 gap-0">
        <DialogTitle className="sr-only">{isEditing ? `Edit ${connectionType === 'aws-s3' ? 'AWS S3' : connectionType === 'azure-blob' ? 'Azure Blob' : 'SFTP'} Connection` : step === 1 ? 'Choose Connection Type' : `Set Up ${connectionType === 'aws-s3' ? 'AWS S3' : connectionType === 'azure-blob' ? 'Azure Blob' : 'SFTP'} Connection`}</DialogTitle>
        <DialogDescription className="sr-only">Configure connection settings</DialogDescription>
        <ModalHeader
          title={isEditing ? `Edit ${connectionType === 'aws-s3' ? 'AWS S3' : connectionType === 'azure-blob' ? 'Azure Blob' : 'SFTP'} Connection` : step === 1 ? 'Choose Connection Type' : `Set Up ${connectionType === 'aws-s3' ? 'AWS S3' : connectionType === 'azure-blob' ? 'Azure Blob' : 'SFTP'} Connection`}
          onClose={onClose}
        />

        <div className="px-6 py-5">
          {step === 1 ? renderStep1() : renderStep2()}
        </div>

        <ModalFooter
          primaryAction={step === 1
            ? { label: 'Next', onClick: handleNext, disabled: !canProceedStep1 }
            : { label: isEditing ? 'Update Connection' : 'Create Connection', onClick: handleCreate, disabled: !testPassed }
          }
          secondaryAction={{ label: 'Cancel', onClick: onClose, variant: 'ghost' }}
        />
      </DialogContent>
    </Dialog>
  );

  /* ── Step 1: Connection Type ── */
  function renderStep1() {
    return (
      <>
        <div className="grid grid-cols-3 gap-3">
          <CardSelector
            icon={<svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M6 22l10 4 10-4V10L16 6 6 10v12z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M6 10l10 4 10-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M16 14v12" stroke="currentColor" strokeWidth="2" /></svg>}
            label="AWS S3"
            selected={connectionType === 'aws-s3'}
            onClick={() => setConnectionType('aws-s3')}
          />
          <CardSelector
            icon={<svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="5" y="5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" /><rect x="18" y="5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" /><rect x="5" y="18" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" /><rect x="18" y="18" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" /></svg>}
            label="Azure Blob"
            selected={connectionType === 'azure-blob'}
            onClick={() => setConnectionType('azure-blob')}
          />
          <CardSelector
            icon={<svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M4 8a2 2 0 012-2h8l2 3h12a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>}
            label="SFTP"
            selected={connectionType === 'sftp'}
            onClick={() => setConnectionType('sftp')}
          />
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
      <div className="flex flex-col">
        {/* General fields */}
        <div className="space-y-3 pb-5 border-b border-border">
          <div className="space-y-2">
            <Label htmlFor="conn-name-input">Connection Name</Label>
            <Input id="conn-name-input" type="text" placeholder="Enter connection name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="conn-base-path">Base Path</Label>
            <Input id="conn-base-path" type="text" placeholder="/company/inbound/" value={basePath} onChange={(e) => setBasePath(e.target.value)} />
          </div>
        </div>

        {/* Connection Settings section */}
        <div className="pt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Connection Settings</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="aws-region">AWS Region</Label>
              <Select value={awsRegion} onValueChange={setAwsRegion}>
                <SelectTrigger id="aws-region">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east-1">us-east-1</SelectItem>
                  <SelectItem value="us-west-2">us-west-2</SelectItem>
                  <SelectItem value="eu-west-1">eu-west-1</SelectItem>
                  <SelectItem value="ap-southeast-2">ap-southeast-2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bucket-name">Bucket Name</Label>
              <Input id="bucket-name" type="text" placeholder="Add bucket" value={bucketName} onChange={(e) => setBucketName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s3-prefix">Prefix (optional)</Label>
              <Input id="s3-prefix" type="text" placeholder="Add prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Authentication section — inset card */}
        <div className="mt-6 bg-secondary rounded-lg px-5 py-5">
          <h3 className="text-base font-semibold text-foreground mb-3">Authentication</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="aws-auth-method">Authentication Method</Label>
              <Select value={awsAuthMethod} onValueChange={(v) => setAwsAuthMethod(v as AwsAuthMethod)}>
                <SelectTrigger id="aws-auth-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="access-key">Access Key</SelectItem>
                  <SelectItem value="iam-role">IAM Role</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {awsAuthMethod === 'access-key' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="access-key-id">Access Key ID</Label>
                  <Input id="access-key-id" type="text" value={accessKeyId} onChange={(e) => setAccessKeyId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret-access-key">Secret Access Key</Label>
                  <Input id="secret-access-key" type="password" value={secretAccessKey} onChange={(e) => setSecretAccessKey(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="aws-account-id">AWS Account ID</Label>
                  <Input id="aws-account-id" type="text" value={awsAccountId} onChange={(e) => setAwsAccountId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iam-role-arn">IAM Role ARN</Label>
                  <Input id="iam-role-arn" type="text" value={iamRoleArn} onChange={(e) => setIamRoleArn(e.target.value)} />
                </div>
              </>
            )}

            {/* Test connection row — inline within auth section */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {testStatus === 'success' ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"><CheckCircle size={16} weight="fill" /> Connection verified</span>
              ) : (
                <>
                  {hasConnectionChanged ? <span className="text-sm text-muted-foreground">Test your connection settings</span> : <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"><CheckCircle size={16} weight="fill" /> Connection verified</span>}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing' || !hasConnectionChanged}
                  >
                    {testStatus === 'testing' ? 'Testing…' : 'Test Connection'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Azure Blob ── */
  function renderAzureBlob() {
    return (
      <div className="flex flex-col">
        {/* General fields */}
        <div className="space-y-3 pb-5 border-b border-border">
          <div className="space-y-2">
            <Label htmlFor="conn-name-input">Connection Name</Label>
            <Input id="conn-name-input" type="text" placeholder="Enter connection name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="conn-base-path">Base Path</Label>
            <Input id="conn-base-path" type="text" placeholder="/company/inbound/" value={basePath} onChange={(e) => setBasePath(e.target.value)} />
          </div>
        </div>

        {/* Connection Settings section */}
        <div className="pt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Connection Settings</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="container-name">Container Name</Label>
              <Input id="container-name" type="text" value={containerName} onChange={(e) => setContainerName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Name</Label>
              <Input id="account-name" type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Authentication section — inset card */}
        <div className="mt-6 bg-secondary rounded-lg px-5 py-5">
          <h3 className="text-base font-semibold text-foreground mb-3">Authentication</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="sas-token">SAS Token</Label>
              <Input id="sas-token" type="text" value={sasToken} onChange={(e) => setSasToken(e.target.value)} />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              {testStatus === 'success' ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"><CheckCircle size={16} weight="fill" /> Connection verified</span>
              ) : (
                <>
                  {hasConnectionChanged ? <span className="text-sm text-muted-foreground">Test your connection settings</span> : <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"><CheckCircle size={16} weight="fill" /> Connection verified</span>}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing' || !hasConnectionChanged}
                  >
                    {testStatus === 'testing' ? 'Testing…' : 'Test Connection'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── SFTP ── */
  function renderSftp() {
    return (
      <div className="flex flex-col">
        {/* General fields */}
        <div className="space-y-3 pb-5 border-b border-border">
          <div className="space-y-2">
            <Label htmlFor="conn-name-input">Connection Name</Label>
            <Input id="conn-name-input" type="text" placeholder="Enter connection name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="conn-base-path">Base Path</Label>
            <Input id="conn-base-path" type="text" placeholder="/company/inbound/" value={basePath} onChange={(e) => setBasePath(e.target.value)} />
          </div>
        </div>

        {/* Connection Settings section */}
        <div className="pt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Connection Settings</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="sftp-hostname">Hostname</Label>
              <Input id="sftp-hostname" type="text" value={hostname} onChange={(e) => setHostname(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sftp-port">Port</Label>
              <Input id="sftp-port" type="text" value={port} onChange={(e) => setPort(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Authentication section — inset card */}
        <div className="mt-6 bg-secondary rounded-lg px-5 py-5">
          <h3 className="text-base font-semibold text-foreground mb-3">Authentication</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="sftp-username">Username</Label>
              <Input id="sftp-username" type="text" value={sftpUsername} onChange={(e) => setSftpUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Auth Method</Label>
              <ToggleGroup type="single" value={sftpAuthMethod} onValueChange={(v) => { if (v) setSftpAuthMethod(v as SftpAuthMethod); }}>
                <ToggleGroupItem value="password">Password</ToggleGroupItem>
                <ToggleGroupItem value="ssh-key">SSH Key</ToggleGroupItem>
              </ToggleGroup>
            </div>
            {sftpAuthMethod === 'password' ? (
              <div className="space-y-2">
                <Label htmlFor="sftp-password">Password</Label>
                <Input id="sftp-password" type="password" value={sftpPassword} onChange={(e) => setSftpPassword(e.target.value)} />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="sftp-ssh-key">Public SSH Key</Label>
                <Textarea id="sftp-ssh-key" value={sshKey} onChange={(e) => setSshKey(e.target.value)} />
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              {testStatus === 'success' ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"><CheckCircle size={16} weight="fill" /> Connection verified</span>
              ) : (
                <>
                  {hasConnectionChanged ? <span className="text-sm text-muted-foreground">Test your connection settings</span> : <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"><CheckCircle size={16} weight="fill" /> Connection verified</span>}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing' || !hasConnectionChanged}
                  >
                    {testStatus === 'testing' ? 'Testing…' : 'Test Connection'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
