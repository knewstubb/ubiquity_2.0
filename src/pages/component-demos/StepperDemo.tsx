import { useState } from 'react'
import { Stepper, type StepperStep } from '@/components/composed/stepper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const defaultLabels = ['Details', 'Configuration', 'Review', 'Complete']
const defaultDescriptions = ['Enter your info', 'Set preferences', 'Check everything', 'All done']

export default function StepperDemo() {
  const [currentStep, setCurrentStep] = useState(1)
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('horizontal')
  const [labels, setLabels] = useState(defaultLabels)
  const [descriptions, setDescriptions] = useState(defaultDescriptions)
  const [showDescriptions, setShowDescriptions] = useState(false)
  const [maxWidth, setMaxWidth] = useState(100)

  const completedSteps = Array.from({ length: currentStep }, (_, i) => i)
  const steps: StepperStep[] = labels.map((label, i) => ({
    label,
    description: showDescriptions ? descriptions[i] : undefined,
  }))

  function updateLabel(index: number, value: string) {
    setLabels((prev) => prev.map((l, i) => (i === index ? value : l)))
  }

  function updateDescription(index: number, value: string) {
    setDescriptions((prev) => prev.map((d, i) => (i === index ? value : d)))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Preview frame + controls side by side */}
      <div className="flex gap-4 items-stretch">
        {/* Preview frame */}
        <div className="flex-1 min-w-0 border border-border rounded-lg p-8 flex items-center justify-center">
          <div className={cn(orientation === 'horizontal' ? 'w-full' : 'w-auto')} style={{ maxWidth: `${maxWidth}%` }}>
            <Stepper
              steps={steps}
              currentStep={currentStep}
              completedSteps={completedSteps}
              orientation={orientation}
              onStepClick={(i) => setCurrentStep(i)}
            />
          </div>
        </div>

        {/* Controls panel */}
        <div className="w-56 shrink-0 p-4 bg-secondary rounded-lg space-y-4">
          {/* Orientation */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Orientation</span>
            <Select value={orientation} onValueChange={(v) => setOrientation(v as 'vertical' | 'horizontal')}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Step navigation */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Max Width — {maxWidth}%
            </span>
            <input
              type="range"
              min={10}
              max={100}
              value={maxWidth}
              onChange={(e) => setMaxWidth(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-border cursor-pointer accent-primary"
            />
          </div>

          {/* Step navigation */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Step {currentStep + 1} of {labels.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={() => setCurrentStep((s) => Math.min(labels.length - 1, s + 1))}
                disabled={currentStep === labels.length - 1}
                className="flex-1"
              >
                Next
              </Button>
            </div>
          </div>

          {/* Descriptions toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descriptions</span>
            <Switch checked={showDescriptions} onCheckedChange={setShowDescriptions} />
          </div>

          {/* Label editors */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Labels</span>
            {labels.map((label, i) => (
              <div key={i} className="space-y-1">
                <Label className="text-xs text-tertiary-foreground">Step {i + 1}</Label>
                <Input
                  value={label}
                  onChange={(e) => updateLabel(i, e.target.value)}
                  className="h-7 text-xs"
                />
                {showDescriptions && (
                  <Input
                    value={descriptions[i]}
                    onChange={(e) => updateDescription(i, e.target.value)}
                    className="h-7 text-xs"
                    placeholder="Description…"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
