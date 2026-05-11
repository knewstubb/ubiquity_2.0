import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarBlank } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export default function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [pickerDate, setPickerDate] = useState<Date | undefined>(undefined)
  const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  return (
    <div className="flex flex-col gap-10">
      {/* Date Picker (Popover) */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Date Picker (Popover)</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-fit justify-start text-left",
                !pickerDate && "text-muted-foreground"
              )}
            >
              <CalendarBlank weight="bold" className="mr-2 h-4 w-4" />
              {pickerDate ? pickerDate.toLocaleDateString() : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-lg overflow-hidden" align="start" sideOffset={8}>
            <Calendar
              mode="single"
              selected={pickerDate}
              onSelect={setPickerDate}
              captionLayout="dropdown"
              startMonth={new Date(2020, 0)}
              endMonth={new Date(2030, 11)}
            />
          </PopoverContent>
        </Popover>
        <p className="text-sm text-muted-foreground">
          Selected: {pickerDate ? pickerDate.toLocaleDateString() : 'None'}
        </p>
      </section>

      {/* Month & Year Dropdown Selector */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Month & Year Dropdown</h3>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          captionLayout="dropdown"
          startMonth={new Date(2020, 0)}
          endMonth={new Date(2030, 11)}
          className="rounded-lg border border-border shadow-sm w-fit"
        />
      </section>

      {/* Basic (Label Caption) */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Basic (Label Caption)</h3>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-lg border border-border shadow-sm w-fit"
        />
      </section>

      {/* Range selection with two months */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Date Range (Two Months)</h3>
        <Calendar
          mode="range"
          selected={range.from && range.to ? { from: range.from, to: range.to } : undefined}
          onSelect={(r) => setRange({ from: r?.from, to: r?.to })}
          numberOfMonths={2}
          className="rounded-lg border border-border shadow-sm w-fit"
        />
        <p className="text-sm text-muted-foreground">
          Range: {range.from?.toLocaleDateString() ?? '—'} to {range.to?.toLocaleDateString() ?? '—'}
        </p>
      </section>
    </div>
  )
}
