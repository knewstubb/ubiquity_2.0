import {
  MagnifyingGlass,
  GearSix,
  X,
  Check,
  ArrowRight,
  Plus,
  Trash,
  ClipboardText,
  User,
  EnvelopeSimple,
  Bell,
  Folder,
  DownloadSimple,
  ArrowSquareOut,
  Star,
  ChatCircle,
} from '@phosphor-icons/react'

const SAMPLE_ICONS = [
  { name: 'MagnifyingGlass', Icon: MagnifyingGlass },
  { name: 'GearSix', Icon: GearSix },
  { name: 'X', Icon: X },
  { name: 'Check', Icon: Check },
  { name: 'ArrowRight', Icon: ArrowRight },
  { name: 'Plus', Icon: Plus },
  { name: 'Trash', Icon: Trash },
  { name: 'ClipboardText', Icon: ClipboardText },
  { name: 'User', Icon: User },
  { name: 'EnvelopeSimple', Icon: EnvelopeSimple },
  { name: 'Bell', Icon: Bell },
  { name: 'Folder', Icon: Folder },
  { name: 'DownloadSimple', Icon: DownloadSimple },
  { name: 'ArrowSquareOut', Icon: ArrowSquareOut },
  { name: 'Star', Icon: Star },
  { name: 'ChatCircle', Icon: ChatCircle },
] as const

export function IconSection() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[13px] text-foreground">
          <span className="font-semibold text-muted-foreground">Icon Library:</span>
          <span>Phosphor Icons</span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-foreground">
          <span className="font-semibold text-muted-foreground">Style:</span>
          <span>Regular weight</span>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
        {SAMPLE_ICONS.map(({ name, Icon }) => (
          <div key={name} className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-md border border-border bg-background">
            <Icon size={24} className="text-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full">{name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
