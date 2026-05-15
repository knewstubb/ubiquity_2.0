import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ModalHeader } from '@/components/composed/modal-header'
import { ModalFooter } from '@/components/composed/modal-footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ModalDemoProps {
  title?: string
  description?: string
  'field-count'?: number
  'show-footer'?: boolean
  'primary-label'?: string
  'show-cancel'?: boolean
  'primary-variant'?: string
}

const FIELD_LABELS = ['Segment Name', 'Description', 'Tags', 'Category', 'Priority']
const FIELD_PLACEHOLDERS = ['e.g. Gold Members', 'Optional description', 'Add tags...', 'Select category', 'High / Medium / Low']

export default function ModalDemo(props: ModalDemoProps) {
  const hasControls = props.title !== undefined
  const [open1, setOpen1] = useState(false)
  const [open2, setOpen2] = useState(false)
  const [open3, setOpen3] = useState(false)

  if (hasControls) {
    const title = (props.title as string) ?? 'New Segment'
    const description = (props.description as string) ?? 'Create a new audience segment.'
    const fieldCount = (props['field-count'] as number) ?? 2
    const showFooter = props['show-footer'] ?? true
    const primaryLabel = (props['primary-label'] as string) ?? 'Create'
    const showCancel = props['show-cancel'] ?? true
    const primaryVariant = (props['primary-variant'] as string) ?? 'default'

    return (
      <div className="w-[560px] border border-border rounded-lg overflow-hidden bg-background shadow-md">
        <ModalHeader title={title} description={description || undefined} onClose={() => {}} />
        <div className="px-6 pt-3 pb-5 space-y-4">
          {Array.from({ length: fieldCount }, (_, i) => (
            <div key={i} className="space-y-2">
              <Label htmlFor={`modal-field-${i}`}>{FIELD_LABELS[i] ?? `Field ${i + 1}`}</Label>
              <Input id={`modal-field-${i}`} placeholder={FIELD_PLACEHOLDERS[i] ?? 'Enter value...'} />
            </div>
          ))}
        </div>
        {showFooter && (
          <ModalFooter
            primaryAction={{ label: primaryLabel, onClick: () => {}, variant: primaryVariant as 'default' | 'destructive' }}
            secondaryAction={showCancel ? { label: 'Cancel', onClick: () => {} } : undefined}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header variants */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Modal Header</h3>
        <p className="text-sm text-muted-foreground">Title + close button with bottom border. Supports optional description and rich ReactNode titles.</p>
        <div className="flex flex-col gap-4 max-w-md">
          <div className="border border-border rounded-lg overflow-hidden">
            <ModalHeader title="New Connection" onClose={() => {}} />
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <ModalHeader title="Delete Connection" description="This action cannot be undone." onClose={() => {}} />
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <ModalHeader
              title={<>New Automation using the <span className="text-primary">Online Marketing</span> Connection</>}
              onClose={() => {}}
            />
          </div>
        </div>
      </section>

      {/* Footer variants */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Modal Footer</h3>
        <p className="text-sm text-muted-foreground">Action bar with up to 3 button slots. Tertiary pushes left.</p>
        <div className="flex flex-col gap-4 max-w-md">
          <div className="border border-border rounded-lg overflow-hidden">
            <ModalFooter
              primaryAction={{ label: 'Next', onClick: () => {} }}
              secondaryAction={{ label: 'Cancel', onClick: () => {} }}
            />
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <ModalFooter
              primaryAction={{ label: 'Create', onClick: () => {} }}
              secondaryAction={{ label: 'Cancel', onClick: () => {} }}
              tertiaryAction={{ label: 'Back', onClick: () => {} }}
            />
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <ModalFooter
              primaryAction={{ label: 'Delete', onClick: () => {}, variant: 'destructive' }}
              secondaryAction={{ label: 'Cancel', onClick: () => {} }}
            />
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <ModalFooter
              primaryAction={{ label: 'Next', onClick: () => {}, disabled: true }}
              secondaryAction={{ label: 'Cancel', onClick: () => {} }}
            />
          </div>
        </div>
      </section>

      {/* Full modal examples */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Full Modal</h3>
        <p className="text-sm text-muted-foreground">Complete modal pattern: ModalHeader + body + ModalFooter inside DialogContent.</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setOpen1(true)}>Basic Modal</Button>
          <Button variant="outline" onClick={() => setOpen2(true)}>With Form</Button>
          <Button variant="outline" onClick={() => setOpen3(true)}>Destructive</Button>
        </div>

        {/* Basic */}
        <Dialog open={open1} onOpenChange={setOpen1}>
          <DialogContent className="max-w-[480px] p-0 gap-0">
            <DialogTitle className="sr-only">Example Modal</DialogTitle>
            <DialogDescription className="sr-only">Example modal dialog</DialogDescription>
            <ModalHeader title="Example Modal" onClose={() => setOpen1(false)} />
            <div className="px-6 py-6">
              <p className="text-sm text-muted-foreground">This is the modal body. Any content goes here.</p>
            </div>
            <ModalFooter
              primaryAction={{ label: 'Done', onClick: () => setOpen1(false) }}
              secondaryAction={{ label: 'Cancel', onClick: () => setOpen1(false) }}
            />
          </DialogContent>
        </Dialog>

        {/* With form */}
        <Dialog open={open2} onOpenChange={setOpen2}>
          <DialogContent className="max-w-[480px] p-0 gap-0">
            <DialogTitle className="sr-only">New Segment</DialogTitle>
            <DialogDescription className="sr-only">Create a new segment</DialogDescription>
            <ModalHeader title="New Segment" description="Create a new audience segment." onClose={() => setOpen2(false)} />
            <div className="px-6 py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="demo-name">Segment Name</Label>
                <Input id="demo-name" placeholder="e.g. Gold Members" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-desc">Description</Label>
                <Input id="demo-desc" placeholder="Optional description" />
              </div>
            </div>
            <ModalFooter
              primaryAction={{ label: 'Create Segment', onClick: () => setOpen2(false) }}
              secondaryAction={{ label: 'Cancel', onClick: () => setOpen2(false) }}
            />
          </DialogContent>
        </Dialog>

        {/* Destructive */}
        <Dialog open={open3} onOpenChange={setOpen3}>
          <DialogContent className="max-w-[420px] p-0 gap-0">
            <DialogTitle className="sr-only">Delete Connection</DialogTitle>
            <DialogDescription className="sr-only">Confirm deletion</DialogDescription>
            <ModalHeader title="Delete Connection" description="This action cannot be undone." onClose={() => setOpen3(false)} />
            <div className="px-6 py-6">
              <p className="text-sm text-foreground">Are you sure you want to delete this connection? All associated automations will stop running.</p>
            </div>
            <ModalFooter
              primaryAction={{ label: 'Delete', onClick: () => setOpen3(false), variant: 'destructive' }}
              secondaryAction={{ label: 'Cancel', onClick: () => setOpen3(false) }}
            />
          </DialogContent>
        </Dialog>
      </section>
    </div>
  )
}
