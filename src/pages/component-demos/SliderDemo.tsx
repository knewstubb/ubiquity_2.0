import { useState } from 'react'
import { Slider } from '@/components/ui/slider'

export default function SliderDemo() {
  const [value, setValue] = useState([50])
  const [range, setRange] = useState([25, 75])

  return (
    <div className="flex flex-col gap-8 max-w-md">
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Send volume</span>
          <span className="text-muted-foreground">{value[0]}%</span>
        </div>
        <Slider value={value} onValueChange={setValue} max={100} step={1} />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Age range</span>
          <span className="text-muted-foreground">{range[0]} – {range[1]}</span>
        </div>
        <Slider value={range} onValueChange={setRange} max={100} step={1} />
      </div>

      <div className="space-y-3">
        <span className="text-sm">Disabled</span>
        <Slider defaultValue={[33]} max={100} step={1} disabled />
      </div>
    </div>
  )
}
