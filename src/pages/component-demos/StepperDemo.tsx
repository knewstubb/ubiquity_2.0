import { useState } from 'react'
import { Stepper, type StepperStep } from '@/components/composed/stepper'
import { cn } from '@/lib/utils'

const defaultLabels = ['Details', 'Configuration', 'Review', 'Complete']
const defaultDescriptions = ['Enter your info', 'Set preferences', 'Check everything', 'All done']

interface StepperDemoProps {
  orientation?: string
  'max-width'?: number
  descriptions?: boolean
  'current-step'?: number
  'step-0-label'?: string
  'step-1-label'?: string
  'step-2-label'?: string
  'step-3-label'?: string
}

export default function StepperDemo(props: StepperDemoProps) {
  const [localStep, setLocalStep] = useState(1)

  const hasControls = props.orientation !== undefined

  const orientation = (props.orientation ?? 'horizontal') as 'vertical' | 'horizontal'
  const maxWidth = props['max-width'] ?? 100
  const showDescriptions = props.descriptions ?? false
  const currentStep = props['current-step'] ?? localStep

  const labels = defaultLabels.map((def, i) => {
    const key = `step-${i}-label` as keyof StepperDemoProps
    return (props[key] as string) ?? def
  })

  const completedSteps = Array.from({ length: currentStep }, (_, i) => i)
  const steps: StepperStep[] = labels.map((label, i) => ({
    label,
    description: showDescriptions ? defaultDescriptions[i] : undefined,
  }))

  function handleStepClick(i: number) {
    if (!hasControls) {
      setLocalStep(i)
    }
  }

  if (hasControls) {
    return (
      <div className={cn(orientation === 'horizontal' ? 'w-full' : 'w-auto')} style={{ maxWidth: `${maxWidth}%` }}>
        <Stepper
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          orientation={orientation}
          onStepClick={handleStepClick}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Horizontal */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Horizontal</h3>
        <Stepper
          steps={steps}
          currentStep={localStep}
          completedSteps={Array.from({ length: localStep }, (_, i) => i)}
          orientation="horizontal"
          onStepClick={(i) => setLocalStep(i)}
        />
      </section>

      {/* Vertical */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Vertical</h3>
        <Stepper
          steps={steps}
          currentStep={localStep}
          completedSteps={Array.from({ length: localStep }, (_, i) => i)}
          orientation="vertical"
          onStepClick={(i) => setLocalStep(i)}
        />
      </section>
    </div>
  )
}
