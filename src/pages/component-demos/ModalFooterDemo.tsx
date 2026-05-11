import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ModalHeader } from '@/components/composed/modal-header'
import { ModalFooter } from '@/components/composed/modal-footer'
import { Button } from '@/components/ui/button'

export default function ModalFooterDemo() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-8">
      {/* Primary + Secondary */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Primary + Secondary</h3>
        <p className="text-sm text-muted-foreground">Standard footer with Cancel and primary action.</p>
        <div className="border border-border rounded-lg overflow-hidden max-w-md">
          <ModalFooter
            primaryAction={{ label: 'Next', onClick: () => {} }}
            secondaryAction={{ label: 'Cancel', onClick: () => {} }}
          />
        </div>
      </section>

      {/* All three buttons */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Primary + Secondary + Tertiary</h3>
        <p className="text-sm text-muted-foreground">Tertiary button (e.g. Back) pushes to the left.</p>
        <div className="border border-border rounded-lg overflow-hidden max-w-md">
          <ModalFooter
            primaryAction={{ label: 'Create Connection', onClick: () => {} }}
            secondaryAction={{ label: 'Cancel', onClick: () => {} }}
            tertiaryAction={{ label: 'Back', onClick: () => {} }}
          />
        </div>
      </section>

      {/* Primary only */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Primary Only</h3>
        <div className="border border-border rounded-lg overflow-hidden max-w-md">
          <ModalFooter
            primaryAction={{ label: 'Done', onClick: () => {} }}
          />
        </div>
      </section>

      {/* Disabled primary */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Disabled Primary</h3>
        <p className="text-sm text-muted-foreground">Primary button disabled until form is valid.</p>
        <div className="border border-border rounded-lg overflow-hidden max-w-md">
          <ModalFooter
            primaryAction={{ label: 'Next', onClick: () => {}, disabled: true }}
            secondaryAction={{ label: 'Cancel', onClick: () => {} }}
          />
        </div>
      </section>

      {/* Destructive variant */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Destructive Primary</h3>
        <div className="border border-border rounded-lg overflow-hidden max-w-md">
          <ModalFooter
            primaryAction={{ label: 'Delete', onClick: () => {}, variant: 'destructive' }}
            secondaryAction={{ label: 'Cancel', onClick: () => {} }}
          />
        </div>
      </section>

      {/* Full modal example */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Complete Modal</h3>
        <Button variant="outline" onClick={() => setOpen(true)}>Open Full Modal</Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-[520px] p-0 gap-0">
            <DialogTitle className="sr-only">New Connection</DialogTitle>
            <DialogDescription className="sr-only">Create a new connection</DialogDescription>
            <ModalHeader title="New Connection" onClose={() => setOpen(false)} />
            <div className="px-6 py-6">
              <p className="text-sm text-muted-foreground">
                This demonstrates the full modal pattern: ModalHeader + body + ModalFooter.
              </p>
            </div>
            <ModalFooter
              primaryAction={{ label: 'Create', onClick: () => setOpen(false) }}
              secondaryAction={{ label: 'Cancel', onClick: () => setOpen(false) }}
            />
          </DialogContent>
        </Dialog>
      </section>
    </div>
  )
}
