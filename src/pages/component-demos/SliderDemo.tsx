import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface SliderDemoProps {
  'range-mode'?: boolean
  disabled?: boolean
  'show-tooltip'?: boolean
  'value-position'?: 'right' | 'above' | 'below' | 'hidden'
  'show-steps'?: boolean
  'step-count'?: number
  min?: number
  max?: number
}

export default function SliderDemo(props: SliderDemoProps) {
  const {
    'range-mode': rangeMode,
    disabled,
    'show-tooltip': showTooltip,
    'value-position': valuePosition = 'right',
    'show-steps': showSteps,
    'step-count': stepCount = 10,
    min = 0,
    max = 100,
  } = props

  const [value, setValue] = useState([50])
  const [range, setRange] = useState([25, 75])

  const hasControls = props['range-mode'] !== undefined

  if (hasControls) {
    const step = showSteps ? Math.max(1, Math.round((max - min) / stepCount)) : 1

    if (rangeMode) {
      return (
        <div className="w-full max-w-sm space-y-3">
          {valuePosition === 'above' && (
            <div className="text-sm text-muted-foreground tabular-nums text-center">{range[0]} – {range[1]}</div>
          )}
          <div className={cn('flex items-center gap-4', valuePosition === 'right' && 'flex-row', valuePosition !== 'right' && 'flex-col')}>
            <div className="relative flex-1 w-full">
              <Slider
                value={range}
                onValueChange={setRange}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
              />
              {showTooltip && (
                <>
                  <div
                    className="absolute -top-8 bg-foreground text-background text-xs font-medium px-2 py-1 rounded pointer-events-none"
                    style={{ left: `calc(${((range[0] - min) / (max - min)) * 100}% - 16px)` }}
                  >
                    {range[0]}
                  </div>
                  <div
                    className="absolute -top-8 bg-foreground text-background text-xs font-medium px-2 py-1 rounded pointer-events-none"
                    style={{ left: `calc(${((range[1] - min) / (max - min)) * 100}% - 16px)` }}
                  >
                    {range[1]}
                  </div>
                </>
              )}
              {showSteps && (
                <div className="flex justify-between mt-1" style={{ marginLeft: '10px', marginRight: '10px' }}>
                  {Array.from({ length: stepCount + 1 }).map((_, i) => (
                    <div key={i} className="w-0.5 h-1.5 bg-border-strong rounded-full" />
                  ))}
                </div>
              )}
            </div>
            {valuePosition === 'right' && (
              <span className="text-sm text-muted-foreground tabular-nums shrink-0 min-w-[7ch] text-right">{range[0]} – {range[1]}</span>
            )}
          </div>
          {valuePosition === 'below' && (
            <div className="text-sm text-muted-foreground tabular-nums text-center">{range[0]} – {range[1]}</div>
          )}
        </div>
      )
    }

    return (
      <div className="w-full max-w-sm space-y-3">
        {valuePosition === 'above' && (
          <div className="text-sm text-muted-foreground tabular-nums text-center">{value[0]}</div>
        )}
        <div className={cn('flex items-center gap-4', valuePosition === 'right' && 'flex-row', valuePosition !== 'right' && 'flex-col')}>
          <div className="relative flex-1 w-full">
            <Slider
              value={value}
              onValueChange={setValue}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
            />
            {showTooltip && (
              <div
                className="absolute -top-8 bg-foreground text-background text-xs font-medium px-2 py-1 rounded pointer-events-none"
                style={{ left: `calc(${((value[0] - min) / (max - min)) * 100}% - 16px)` }}
              >
                {value[0]}
              </div>
            )}
            {showSteps && (
              <div className="flex justify-between mt-1" style={{ marginLeft: '10px', marginRight: '10px' }}>
                {Array.from({ length: stepCount + 1 }).map((_, i) => (
                  <div key={i} className="w-0.5 h-1.5 bg-border-strong rounded-full" />
                ))}
              </div>
            )}
          </div>
          {valuePosition === 'right' && (
            <span className="text-sm text-muted-foreground tabular-nums shrink-0 min-w-[3ch] text-right">{value[0]}</span>
          )}
        </div>
        {valuePosition === 'below' && (
          <div className="text-sm text-muted-foreground tabular-nums text-center">{value[0]}</div>
        )}
      </div>
    )
  }

  // Showcase mode — no inline controller panel, just slider variants
  return (
    <div className="flex flex-col gap-8">
      {/* Default slider */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Default</h3>
        <div className="max-w-sm flex items-center gap-4">
          <Slider value={value} onValueChange={setValue} min={0} max={100} step={1} />
          <span className="text-sm text-muted-foreground tabular-nums shrink-0 min-w-[3ch] text-right">{value[0]}</span>
        </div>
      </section>

      {/* Range slider */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Range</h3>
        <div className="max-w-sm flex items-center gap-4">
          <Slider value={range} onValueChange={setRange} min={0} max={100} step={1} />
          <span className="text-sm text-muted-foreground tabular-nums shrink-0 min-w-[7ch] text-right">{range[0]} – {range[1]}</span>
        </div>
      </section>

      {/* Disabled */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Disabled</h3>
        <div className="max-w-sm">
          <Slider defaultValue={[40]} min={0} max={100} step={1} disabled />
        </div>
      </section>

      {/* With steps */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">With Steps</h3>
        <div className="max-w-sm">
          <Slider defaultValue={[50]} min={0} max={100} step={10} />
          <div className="flex justify-between mt-1" style={{ marginLeft: '10px', marginRight: '10px' }}>
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="w-0.5 h-1.5 bg-border-strong rounded-full" />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
