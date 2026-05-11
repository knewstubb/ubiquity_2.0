import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function AvatarDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/150?u=sarah" alt="Sarah Chen" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/150?u=james" alt="James Wilson" />
          <AvatarFallback>JW</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/150?u=maria" alt="Maria Lopez" />
          <AvatarFallback>ML</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">BK</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback className="bg-info text-white">TN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback className="bg-warning text-white">RP</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">SM</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>MD</AvatarFallback>
        </Avatar>
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg">LG</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
