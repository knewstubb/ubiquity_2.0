import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export default function SliderDemo() {
  const [value, setValue] = useState([50])
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(100)
  const [disabled, setDisabled] = useState(false)
  const [showRange, setShowRange] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [stepCount, setStepCount] = useState(10)
  const [range, setRange] = useState([25, 75])
  const [valuePosition, setValuePosition] = useState<'above' | 'right' | 'below' | 'hidden'>('right')

  const step = showSteps ? Math.max(1, Math.round((max - min) / stepCount)) : 1

  return (
    <div className="flex gap-4 items-stretch">
      {/* Preview frame */}
      <div className="flex-1 min-w-0 border border-border rounded-lg p-8 flex items-center justify-center">
        <div className="w-full max-w-sm space-y-8">
          {/* Single value slider */}
          {!showRange && (
            <div className="space-y-3 relative">
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
          )}

          {/* Range slider */}
          {showRange && (
            <div className="space-y-3 relative">
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
          )}
        </div>
      </div>

      {/* Controls panel */}
      <div className="w-56 shrink-0 ml-auto p-4 bg-secondary rounded-lg space-y-4">
        {/* Range mode */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Range Mode</span>
          <Switch checked={showRange} onCheckedChange={setShowRange} />
        </div>

        {/* Disabled */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Disabled</span>
          <Switch checked={disabled} onCheckedChange={setDisabled} />
        </div>

        {/* Tooltip */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Show Tooltip</span>
          <Switch checked={showTooltip} onCheckedChange={setShowTooltip} />
        </div>

        {/* Value position */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Value Position</span>
          <Select value={valuePosition} onValueChange={(v) => setValuePosition(v as typeof valuePosition)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="right">Right</SelectItem>
              <SelectItem value="above">Above</SelectItem>
              <SelectItem value="below">Below</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Show Steps</span>
          <Switch checked={showSteps} onCheckedChange={setShowSteps} />
        </div>

        {showSteps && (
          <div className="space-y-1.5">
            <div className="flex items-center rounded-md border border-input bg-background h-7 overflow-hidden focus-within:border-ring focus-within:shadow-[0_0_0_3px_rgba(20,184,138,0.15)]">
              <span className="shrink-0 text-xs text-muted-foreground select-none bg-secondary px-2 self-stretch flex items-center border-r border-input">Steps</span>
              <input
                type="number"
                value={stepCount}
                onChange={(e) => setStepCount(Math.max(2, Number(e.target.value)))}
                min={2}
                max={50}
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs text-foreground px-2"
              />
            </div>
          </div>
        )}

        {/* Range bounds */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">Range</span>
          <div className="flex items-center rounded-md border border-input bg-background h-7 overflow-hidden focus-within:border-ring focus-within:shadow-[0_0_0_3px_rgba(20,184,138,0.15)]">
            <span className="shrink-0 text-xs text-muted-foreground select-none bg-secondary px-2 self-stretch flex items-center border-r border-input">Min</span>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs text-foreground px-2"
            />
          </div>
          <div className="flex items-center rounded-md border border-input bg-background h-7 overflow-hidden focus-within:border-ring focus-within:shadow-[0_0_0_3px_rgba(20,184,138,0.15)]">
            <span className="shrink-0 text-xs text-muted-foreground select-none bg-secondary px-2 self-stretch flex items-center border-r border-input">Max</span>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs text-foreground px-2"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
