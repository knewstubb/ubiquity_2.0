import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ModalHeader } from '@/components/composed/modal-header'
import { Button } from '@/components/ui/button'

export default function ModalHeaderDemo() {
  const [open1, setOpen1] = useState(false)
  const [open2, setOpen2] = useState(false)

  return (
    <div className="flex flex-col gap-8">
      {/* Basic header */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Basic Modal Header</h3>
        <p className="text-sm text-muted-foreground">Title + close button with bottom border separator.</p>
        <div className="border border-border rounded-lg overflow-hidden max-w-md">
          <ModalHeader title="New Connection" onClose={() => {}} />
        </div>
      </section>

      {/* With description */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">With Description</h3>
        <p className="text-sm text-muted-foreground">Optional subtitle below the title.</p>
        <div className="border border-border rounded-lg overflow-hidden max-w-md">
          <ModalHeader
            title="Delete Connection"
            description="This action cannot be undone."
            onClose={() => {}}
          />
        </div>
      </section>

      {/* Rich title */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Rich Title (ReactNode)</h3>
        <p className="text-sm text-muted-foreground">Title accepts ReactNode for inline styling.</p>
        <div className="border border-border rounded-lg overflow-hidden max-w-md">
          <ModalHeader
            title={<>New Automation using the <span className="text-primary">Online Marketing</span> Connection</>}
            onClose={() => {}}
          />
        </div>
      </section>

      {/* In a real dialog */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">In a Dialog</h3>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setOpen1(true)}>Open Basic Modal</Button>
          <Button variant="outline" onClick={() => setOpen2(true)}>Open With Description</Button>
        </div>

        <Dialog open={open1} onOpenChange={setOpen1}>
          <DialogContent className="max-w-[480px] p-0 gap-0">
            <DialogTitle className="sr-only">New Connection</DialogTitle>
            <DialogDescription className="sr-only">Create a new connection</DialogDescription>
            <ModalHeader title="New Connection" onClose={() => setOpen1(false)} />
            <div className="px-6 py-6">
              <p className="text-sm text-muted-foreground">Modal body content goes here.</p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={open2} onOpenChange={setOpen2}>
          <DialogContent className="max-w-[480px] p-0 gap-0">
            <DialogTitle className="sr-only">Confirm Deletion</DialogTitle>
            <DialogDescription className="sr-only">Confirm deletion of connection</DialogDescription>
            <ModalHeader
              title="Confirm Deletion"
              description="This will permanently remove the connection."
              onClose={() => setOpen2(false)}
            />
            <div className="px-6 py-6">
              <p className="text-sm text-muted-foreground">Are you sure you want to proceed?</p>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  )
}
