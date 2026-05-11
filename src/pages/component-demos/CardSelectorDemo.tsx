import { useState } from 'react'
import { CardSelector } from '@/components/composed/card-selector'
import { DownloadSimple, UploadSimple, CloudArrowUp, FolderOpen, Database } from '@phosphor-icons/react'

export default function CardSelectorDemo() {
  const [direction, setDirection] = useState<'import' | 'export' | null>(null)
  const [connType, setConnType] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-8">
      {/* Two-option selector */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Direction Selector</h3>
        <div className="flex gap-3">
          <CardSelector
            icon={<DownloadSimple size={24} />}
            label="Importer"
            selected={direction === 'import'}
            onClick={() => setDirection('import')}
          />
          <CardSelector
            icon={<UploadSimple size={24} />}
            label="Exporter"
            selected={direction === 'export'}
            onClick={() => setDirection('export')}
          />
        </div>
      </section>

      {/* Three-option selector */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Connection Type</h3>
        <div className="flex gap-3">
          <CardSelector
            icon={<CloudArrowUp size={24} />}
            label="AWS S3"
            selected={connType === 's3'}
            onClick={() => setConnType('s3')}
          />
          <CardSelector
            icon={<Database size={24} />}
            label="Azure Blob"
            selected={connType === 'azure'}
            onClick={() => setConnType('azure')}
          />
          <CardSelector
            icon={<FolderOpen size={24} />}
            label="SFTP"
            selected={connType === 'sftp'}
            onClick={() => setConnType('sftp')}
          />
        </div>
      </section>

      {/* Disabled state */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Disabled</h3>
        <div className="flex gap-3">
          <CardSelector
            icon={<DownloadSimple size={24} />}
            label="Disabled"
            disabled
          />
          <CardSelector
            icon={<UploadSimple size={24} />}
            label="Selected + Disabled"
            selected
            disabled
          />
        </div>
      </section>
    </div>
  )
}
