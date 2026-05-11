import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { TextControl } from '../TextControl'
import { SelectControl } from '../SelectControl'
import { ToggleControl } from '../ToggleControl'
import { ColourControl } from '../ColourControl'
import { NumberControl } from '../NumberControl'
import { RangeControl } from '../RangeControl'
import { RadioControl } from '../RadioControl'

// Radix Slider uses ResizeObserver internally
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe('TextControl', () => {
  it('renders a text input element', () => {
    render(<TextControl value="hello" onChange={() => {}} label="Name" />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
  })

  it('renders the label', () => {
    render(<TextControl value="" onChange={() => {}} label="Username" />)
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('displays the current value', () => {
    render(<TextControl value="current-val" onChange={() => {}} label="Field" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('current-val')
  })

  it('calls onChange with the new string value on input change', () => {
    const onChange = vi.fn()
    render(<TextControl value="" onChange={onChange} label="Name" />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'new value' } })
    expect(onChange).toHaveBeenCalledWith('new value')
  })
})

describe('SelectControl', () => {
  const options = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
  ]

  it('renders a select trigger element', () => {
    render(
      <SelectControl value="a" onChange={() => {}} label="Variant" options={options} />
    )
    // shadcn Select renders a trigger button with role="combobox"
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })

  it('renders the label', () => {
    render(
      <SelectControl value="a" onChange={() => {}} label="Variant" options={options} />
    )
    expect(screen.getByText('Variant')).toBeInTheDocument()
  })
})

describe('ToggleControl', () => {
  it('renders a switch element', () => {
    render(<ToggleControl value={false} onChange={() => {}} label="Enabled" />)
    const switchEl = screen.getByRole('switch')
    expect(switchEl).toBeInTheDocument()
  })

  it('renders the label', () => {
    render(<ToggleControl value={false} onChange={() => {}} label="Dark Mode" />)
    expect(screen.getByText('Dark Mode')).toBeInTheDocument()
  })

  it('reflects the current boolean value', () => {
    render(<ToggleControl value={true} onChange={() => {}} label="Active" />)
    const switchEl = screen.getByRole('switch')
    expect(switchEl).toHaveAttribute('data-state', 'checked')
  })

  it('calls onChange with toggled boolean value on click', () => {
    const onChange = vi.fn()
    render(<ToggleControl value={false} onChange={onChange} label="Toggle" />)
    const switchEl = screen.getByRole('switch')
    fireEvent.click(switchEl)
    expect(onChange).toHaveBeenCalledWith(true)
  })
})

describe('ColourControl', () => {
  it('renders a select dropdown for colour tokens', () => {
    render(<ColourControl value="#14B88A" onChange={() => {}} label="Background" />)
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })

  it('renders the label', () => {
    render(<ColourControl value="#14B88A" onChange={() => {}} label="Primary" />)
    expect(screen.getByText('Primary')).toBeInTheDocument()
  })

  it('displays a colour swatch for the current value', () => {
    const { container } = render(<ColourControl value="#14B88A" onChange={() => {}} label="Color" />)
    const swatch = container.querySelector('span[style*="background-color"]')
    expect(swatch).toBeInTheDocument()
  })
})

describe('NumberControl', () => {
  it('renders a number input element', () => {
    render(<NumberControl value={10} onChange={() => {}} label="Size" />)
    const input = screen.getByRole('spinbutton')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'number')
  })

  it('renders the label', () => {
    render(<NumberControl value={5} onChange={() => {}} label="Font Size" />)
    expect(screen.getByText('Font Size')).toBeInTheDocument()
  })

  it('displays the current numeric value', () => {
    render(<NumberControl value={42} onChange={() => {}} label="Count" />)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveValue(42)
  })

  it('calls onChange with the new number value on input change', () => {
    const onChange = vi.fn()
    render(<NumberControl value={10} onChange={onChange} label="Size" />)
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '25' } })
    expect(onChange).toHaveBeenCalledWith(25)
  })
})

describe('RangeControl', () => {
  it('renders a slider element', () => {
    render(<RangeControl value={50} onChange={() => {}} label="Opacity" />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('renders the label', () => {
    render(<RangeControl value={50} onChange={() => {}} label="Volume" />)
    expect(screen.getByText('Volume')).toBeInTheDocument()
  })

  it('displays the current value as text', () => {
    render(<RangeControl value={75} onChange={() => {}} label="Brightness" />)
    expect(screen.getByText('75')).toBeInTheDocument()
  })
})

describe('RadioControl', () => {
  const options = [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
  ]

  it('renders radio group with correct number of options', () => {
    render(
      <RadioControl value="md" onChange={() => {}} label="Size" options={options} />
    )
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
  })

  it('renders the label', () => {
    render(
      <RadioControl value="sm" onChange={() => {}} label="Size" options={options} />
    )
    expect(screen.getByText('Size')).toBeInTheDocument()
  })

  it('renders option labels', () => {
    render(
      <RadioControl value="sm" onChange={() => {}} label="Size" options={options} />
    )
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Large')).toBeInTheDocument()
  })

  it('reflects the current selected value', () => {
    render(
      <RadioControl value="md" onChange={() => {}} label="Size" options={options} />
    )
    const radios = screen.getAllByRole('radio')
    const mediumRadio = radios.find(r => r.getAttribute('value') === 'md')
    expect(mediumRadio).toHaveAttribute('data-state', 'checked')
  })

  it('calls onChange with the selected value on click', () => {
    const onChange = vi.fn()
    render(
      <RadioControl value="sm" onChange={onChange} label="Size" options={options} />
    )
    const radios = screen.getAllByRole('radio')
    const largeRadio = radios.find(r => r.getAttribute('value') === 'lg')!
    fireEvent.click(largeRadio)
    expect(onChange).toHaveBeenCalledWith('lg')
  })
})
