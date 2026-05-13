import { useState, useCallback } from 'react'
import { CheckCircle, FolderOpen, Package, PlugsConnected, SquaresFour, X } from '@phosphor-icons/react'
import type { Connection } from '../../models/connection'
import { useAccount } from '../../contexts/AccountContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ChooserModal, type ChooserOption } from '@/components/composed/chooser-modal'

type ConnectionType = 'aws-s3' | 'azure-blob' | 'sftp'
type AwsAuthMethod = 'access-key' | 'iam-role'
type TestStatus = 'idle' | 'testing' | 'success'

interface CreateConnectionModalProps {
  onClose: () => void
  onCreate: (connection: Connection) => void
  editConnection?: Connection
}

export function CreateConnectionModal({ onClose, onCreate, editConnection }: CreateConnectionModalProps) {
  const isEditing = !!editConnection
  const { selectedAccountId } = useAccount()
  const [step, setStep] = useState<1 | 2>(isEditing ? 2 : 1)

  // Step 1 state
  const [name, setName] = useState(editConnection?.name ?? '')
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(
    editConnection ? (editConnection.protocol === 'S3' ? 'aws-s3' : editConnection.protocol === 'Azure Blob' ? 'azure-blob' : 'sftp') : null,
  )
  const [basePath, setBasePath] = useState(editConnection?.basePath ?? '')

  // Step 2 — AWS S3
  const s3Config = editConnection?.protocol === 'S3' ? editConnection.config as { region: string; bucket: string; prefix: string; accessKeyId?: string; secretAccessKey?: string } : null
  const [awsRegion, setAwsRegion] = useState(s3Config?.region ?? '')
  const [bucketName, setBucketName] = useState(s3Config?.bucket ?? '')
  const [prefix, setPrefix] = useState(s3Config?.prefix ?? '')
  const [awsAuthMethod, setAwsAuthMethod] = useState<AwsAuthMethod>('access-key')
  const [accessKeyId, setAccessKeyId] = useState(s3Config?.accessKeyId ?? '')
  const [secretAccessKey, setSecretAccessKey] = useState(s3Config?.secretAccessKey ?? '')
  const [awsAccountId, setAwsAccountId] = useState('')
  const [iamRoleArn, setIamRoleArn] = useState('')

  // Step 2 — Azure Blob
  const blobConfig = editConnection?.protocol === 'Azure Blob' ? editConnection.config as { containerName: string; accountName: string; sasToken?: string } : null
  const [containerName, setContainerName] = useState(blobConfig?.containerName ?? '')
  const [accountName, setAccountName] = useState(blobConfig?.accountName ?? '')
  const [sasToken, setSasToken] = useState(blobConfig?.sasToken ?? '')

  // Step 2 — SFTP
  const sftpConfig = editConnection?.protocol === 'SFTP' ? editConnection.config as { host: string; port: number; path: string; username?: string; password?: string } : null
  const [hostname, setHostname] = useState(sftpConfig?.host ?? '')
  const [port, setPort] = useState(sftpConfig?.port?.toString() ?? '22')
  const [sftpUsername, setSftpUsername] = useState(sftpConfig?.username ?? '')
  const [sshKey, setSshKey] = useState('')

  // Test connection
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const testPassed = testStatus === 'success'

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
      sftpUsername !== (sftpConfig?.username ?? '')
    )) ||
    (connectionType === 'azure-blob' && (
      containerName !== (blobConfig?.containerName ?? '') ||
      accountName !== (blobConfig?.accountName ?? '') ||
      sasToken !== (blobConfig?.sasToken ?? '')
    ))
  ) : true

  const canProceedStep1 = connectionType !== null

  const connectionTypeOptions: ChooserOption[] = [
    { id: 'aws-s3', icon: <Package size={28} weight="light" />, label: 'AWS S3' },
    { id: 'azure-blob', icon: <SquaresFour size={28} weight="light" />, label: 'Azure Blob' },
    { id: 'sftp', icon: <FolderOpen size={28} weight="light" />, label: 'SFTP' },
  ]

  const handleNext = useCallback(() => {
    if (canProceedStep1) setStep(2)
  }, [canProceedStep1])

  function handleBack() {
    setStep(1)
    setTestStatus('idle')
  }

  function handleTestConnection() {
    setTestStatus('testing')
    setTimeout(() => setTestStatus('success'), 1500)
  }

  function handleCreate() {
    if (!connectionType) return

    const protocol = connectionType === 'aws-s3' ? 'S3' as const
      : connectionType === 'azure-blob' ? 'Azure Blob' as const
      : 'SFTP' as const

    const config = connectionType === 'aws-s3'
      ? { region: awsRegion, bucket: bucketName, prefix: prefix }
      : connectionType === 'azure-blob'
      ? { containerName, accountName }
      : { host: hostname, port: parseInt(port) || 22, path: basePath }

    const connection: Connection = {
      id: editConnection?.id ?? crypto.randomUUID(),
      name: name.trim(),
      protocol,
      status: editConnection?.status ?? 'connected',
      basePath: basePath || '/company/base-path/',
      accountId: editConnection?.accountId ?? selectedAccountId,
      config,
    }

    onCreate(connection)
  }

  function getTypeLabel() {
    if (connectionType === 'aws-s3') return 'AWS S3'
    if (connectionType === 'azure-blob') return 'Azure Blob'
    return 'SFTP'
  }

  // Step 1: ChooserModal for connection type selection
  if (step === 1) {
    return (
      <ChooserModal
        open={true}
        onOpenChange={(open) => { if (!open) onClose() }}
        icon={<PlugsConnected size={48} weight="light" />}
        title="Select Connection Type"
        description="Select the protocol your data source uses. This determines how UbiQuity connects to your files."
        options={connectionTypeOptions}
        selectedId={connectionType}
        onSelect={(id) => setConnectionType(id as ConnectionType)}
        onConfirm={handleNext}
        onCancel={onClose}
        confirmDisabled={!canProceedStep1}
      />
    )
  }

  // Step 2: Dialog with type-specific configuration
  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-[560px] p-0 gap-0">
        <DialogHeader className="border-b border-border px-6 py-6 space-y-0">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {isEditing ? `Edit ${getTypeLabel()} Connection` : `Set Up ${getTypeLabel()} Connection`}
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close"
            >
              <X size={20} weight="bold" />
            </button>
          </div>
          <DialogDescription className="sr-only">Configure connection settings</DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {connectionType === 'aws-s3' && renderAwsS3()}
          {connectionType === 'azure-blob' && renderAzureBlob()}
          {connectionType === 'sftp' && renderSftp()}
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreate} disabled={!testPassed}>
            {isEditing ? 'Update Connection' : 'Create Connection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  /* ── AWS S3 ── */
  function renderAwsS3() {
    return (
      <div className="flex flex-col gap-6">
        {/* General fields */}
        <div className="space-y-3">
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
        <div>
          <h3 className="text-base font-semibold tracking-wide text-foreground mb-2">Connection Settings</h3>
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

        {/* Authentication section */}
        <div className="bg-secondary rounded-lg px-5 py-5">
          <h3 className="text-base font-semibold tracking-wide text-foreground mb-2">Authentication</h3>
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

            {renderTestConnectionRow()}
          </div>
        </div>
      </div>
    )
  }

  /* ── Azure Blob ── */
  function renderAzureBlob() {
    return (
      <div className="flex flex-col gap-6">
        {/* General fields */}
        <div className="space-y-3">
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
        <div>
          <h3 className="text-base font-semibold tracking-wide text-foreground mb-2">Connection Settings</h3>
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

        {/* Authentication section */}
        <div className="bg-secondary rounded-lg px-5 py-5">
          <h3 className="text-base font-semibold tracking-wide text-foreground mb-2">Authentication</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="sas-token">SAS Token</Label>
              <Input id="sas-token" type="text" value={sasToken} onChange={(e) => setSasToken(e.target.value)} />
            </div>

            {renderTestConnectionRow()}
          </div>
        </div>
      </div>
    )
  }

  /* ── SFTP ── */
  function renderSftp() {
    return (
      <div className="flex flex-col gap-6">
        {/* General fields */}
        <div className="space-y-3">
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
        <div>
          <h3 className="text-base font-semibold tracking-wide text-foreground mb-2">Connection Settings</h3>
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

        {/* Authentication section */}
        <div className="bg-secondary rounded-lg px-5 py-5">
          <h3 className="text-base font-semibold tracking-wide text-foreground mb-2">Authentication</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="sftp-username">Username</Label>
              <Input id="sftp-username" type="text" value={sftpUsername} onChange={(e) => setSftpUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sftp-ssh-key">Public SSH Key</Label>
              <Textarea id="sftp-ssh-key" value={sshKey} onChange={(e) => setSshKey(e.target.value)} />
            </div>

            {renderTestConnectionRow()}
          </div>
        </div>
      </div>
    )
  }

  /* ── Shared test connection row ── */
  function renderTestConnectionRow() {
    return (
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {testStatus === 'success' ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <CheckCircle size={16} weight="fill" /> Connection verified
          </span>
        ) : (
          <>
            {hasConnectionChanged ? (
              <span className="text-sm text-muted-foreground">Test your connection settings</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                <CheckCircle size={16} weight="fill" /> Connection verified
              </span>
            )}
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
    )
  }
}
