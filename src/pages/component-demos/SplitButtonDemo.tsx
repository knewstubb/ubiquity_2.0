import { FloppyDisk, FileArrowDown, SignOut } from '@phosphor-icons/react'
import { SplitButton } from '@/components/composed/split-button'

interface SplitButtonDemoProps {
  label?: string
  variant?: string
  size?: string
  'option-count'?: number
  disabled?: boolean
}

export default function SplitButtonDemo(props: SplitButtonDemoProps) {
  const label = props.label
  const variant = props.variant as 'default' | 'outline' | undefined
  const size = props.size as 'default' | 'sm' | undefined
  const optionCount = props['option-count']
  const disabled = props.disabled

  const hasControls = label !== undefined

  if (hasControls) {
    const options = Array.from({ length: optionCount ?? 2 }, (_, i) => ({
      label: `Option ${i + 1}`,
      onClick: () => console.log(`Option ${i + 1} clicked`),
    }))

    return (
      <SplitButton
        label={label}
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={() => console.log(`${label} clicked`)}
        options={options}
      />
    )
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Default variant */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Default variant
        </h3>
        <div className="flex flex-wrap gap-4">
          <SplitButton
            label="Save"
            onClick={() => console.log('Save clicked')}
            options={[
              { label: 'Save as Draft', onClick: () => console.log('Save as Draft'), icon: <FloppyDisk size={16} /> },
              { label: 'Save & Close', onClick: () => console.log('Save & Close'), icon: <SignOut size={16} /> },
            ]}
          />
        </div>
      </section>

      {/* Outline variant */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Outline variant
        </h3>
        <div className="flex flex-wrap gap-4">
          <SplitButton
            label="Export"
            variant="outline"
            onClick={() => console.log('Export clicked')}
            options={[
              { label: 'Export as CSV', onClick: () => console.log('CSV'), icon: <FileArrowDown size={16} /> },
              { label: 'Export as PDF', onClick: () => console.log('PDF'), icon: <FileArrowDown size={16} /> },
            ]}
          />
        </div>
      </section>

      {/* Small size */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Small size
        </h3>
        <div className="flex flex-wrap gap-4">
          <SplitButton
            label="Save"
            size="sm"
            onClick={() => console.log('Save clicked')}
            options={[
              { label: 'Save as Draft', onClick: () => console.log('Save as Draft') },
              { label: 'Save & Close', onClick: () => console.log('Save & Close') },
            ]}
          />
          <SplitButton
            label="Export"
            variant="outline"
            size="sm"
            onClick={() => console.log('Export clicked')}
            options={[
              { label: 'Export as CSV', onClick: () => console.log('CSV') },
              { label: 'Export as PDF', onClick: () => console.log('PDF') },
            ]}
          />
        </div>
      </section>

      {/* Disabled state */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Disabled
        </h3>
        <div className="flex flex-wrap gap-4">
          <SplitButton
            label="Save"
            disabled
            onClick={() => console.log('Should not fire')}
            options={[
              { label: 'Save as Draft', onClick: () => console.log('Should not fire') },
            ]}
          />
          <SplitButton
            label="Export"
            variant="outline"
            disabled
            onClick={() => console.log('Should not fire')}
            options={[
              { label: 'Export as CSV', onClick: () => console.log('Should not fire') },
            ]}
          />
        </div>
      </section>
    </div>
  )
}
