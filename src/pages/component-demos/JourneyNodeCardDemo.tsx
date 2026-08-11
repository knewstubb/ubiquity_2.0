import {
  Clock,
  EnvelopeSimple,
  GitFork,
  Lightning,
  Users,
  CalendarBlank,
  ChatText,
  Flag,
} from '@phosphor-icons/react'
import { JourneyNodeCard } from '@/components/journey/nodes/JourneyNodeCard'

interface JourneyNodeCardDemoProps {
  title?: string
  iconType?: 'schedule' | 'email' | 'sms' | 'condition' | 'trigger' | 'wait' | 'exit'
  description?: string
  audienceCount?: number
  isIncomplete?: boolean
  hasError?: boolean
  selected?: boolean
}

const iconMap = {
  schedule: Clock,
  email: EnvelopeSimple,
  sms: ChatText,
  condition: GitFork,
  trigger: Lightning,
  wait: CalendarBlank,
  exit: Flag,
}

const iconColorMap = {
  schedule: 'text-primary',
  email: 'text-primary',
  sms: 'text-violet-500',
  condition: 'text-sky-500',
  trigger: 'text-amber-500',
  wait: 'text-blue-500',
  exit: 'text-red-500',
}

export default function JourneyNodeCardDemo({
  title = 'Schedule',
  iconType = 'schedule',
  description,
  audienceCount,
  isIncomplete = false,
  hasError = false,
  selected = false,
}: JourneyNodeCardDemoProps) {
  const Icon = iconMap[iconType]
  const iconColor = iconColorMap[iconType]

  // Format description with bold text if provided
  const formattedDescription = description ? (
    <span
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: description.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
      }}
    />
  ) : undefined

  const hasControls = title !== 'Schedule' || iconType !== 'schedule' || description !== undefined

  if (hasControls) {
    return (
      <div className="p-8 bg-zinc-100 rounded-lg flex items-center justify-center min-h-[200px]">
        <JourneyNodeCard
          title={title}
          icon={Icon}
          iconColor={iconColor}
          description={formattedDescription}
          audienceCount={audienceCount}
          isIncomplete={isIncomplete}
          hasError={hasError}
          selected={selected}
          showTargetHandle={false}
          sourceHandles={[]}
        />
      </div>
    )
  }

  // Default gallery view
  return (
    <div className="p-8 bg-zinc-100 rounded-lg">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Schedule node */}
        <JourneyNodeCard
          title="Schedule"
          icon={Clock}
          iconColor="text-primary"
          description={
            <>
              <strong>10:30 am</strong> on the <strong>2nd Tuesday</strong> of{' '}
              <strong>every month</strong>
            </>
          }
          audienceCount={533000}
          showTargetHandle={false}
          sourceHandles={[]}
        />

        {/* Send Email node */}
        <JourneyNodeCard
          title="Send Email"
          icon={EnvelopeSimple}
          iconColor="text-primary"
          description="Welcome Series - Email 1"
          audienceCount={12450}
          showTargetHandle={false}
          sourceHandles={[]}
        />

        {/* Conditional split */}
        <JourneyNodeCard
          title="Conditional split"
          icon={GitFork}
          iconColor="text-sky-500"
          description="Has opened email in last 30 days"
          showTargetHandle={false}
          sourceHandles={[]}
        />

        {/* Wait node */}
        <JourneyNodeCard
          title="Wait"
          icon={CalendarBlank}
          iconColor="text-blue-500"
          description={
            <>
              Wait <strong>3 days</strong>
            </>
          }
          audienceCount={8200}
          showTargetHandle={false}
          sourceHandles={[]}
        />

        {/* Incomplete node */}
        <JourneyNodeCard
          title="Send SMS"
          icon={ChatText}
          iconColor="text-violet-500"
          description="Configure message..."
          isIncomplete
          showTargetHandle={false}
          sourceHandles={[]}
        />

        {/* Error node */}
        <JourneyNodeCard
          title="Trigger"
          icon={Lightning}
          iconColor="text-amber-500"
          description="Segment not found"
          hasError
          showTargetHandle={false}
          sourceHandles={[]}
        />

        {/* Selected node */}
        <JourneyNodeCard
          title="Exit"
          icon={Flag}
          iconColor="text-red-500"
          description="Journey completed"
          audienceCount={45200}
          selected
          showTargetHandle={false}
          sourceHandles={[]}
        />
      </div>
    </div>
  )
}
