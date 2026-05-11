import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useControlValues } from './useControlValues'
import type { PropDefinition } from '../data/componentRegistry'

const sampleControls: PropDefinition[] = [
  { name: 'label', label: 'Label', controlType: 'text', defaultValue: 'Hello' },
  { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'primary', options: [{ label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }] },
  { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
  { name: 'size', label: 'Size', controlType: 'number', defaultValue: 16, min: 8, max: 64, step: 2 },
]

describe('useControlValues', () => {
  it('initialises values from defaultValue entries', () => {
    const { result } = renderHook(() => useControlValues(sampleControls))

    expect(result.current.values).toEqual({
      label: 'Hello',
      variant: 'primary',
      disabled: false,
      size: 16,
    })
  })

  it('returns empty values record when given empty array', () => {
    const { result } = renderHook(() => useControlValues([]))

    expect(result.current.values).toEqual({})
  })

  it('setValue updates a single prop by name', () => {
    const { result } = renderHook(() => useControlValues(sampleControls))

    act(() => {
      result.current.setValue('label', 'World')
    })

    expect(result.current.values.label).toBe('World')
    expect(result.current.values.variant).toBe('primary') // unchanged
  })

  it('isDirty is false when all values match defaults', () => {
    const { result } = renderHook(() => useControlValues(sampleControls))

    expect(result.current.isDirty).toBe(false)
  })

  it('isDirty is true when any value differs from default', () => {
    const { result } = renderHook(() => useControlValues(sampleControls))

    act(() => {
      result.current.setValue('disabled', true)
    })

    expect(result.current.isDirty).toBe(true)
  })

  it('resetAll restores all values to defaults', () => {
    const { result } = renderHook(() => useControlValues(sampleControls))

    act(() => {
      result.current.setValue('label', 'Changed')
      result.current.setValue('size', 32)
    })

    expect(result.current.isDirty).toBe(true)

    act(() => {
      result.current.resetAll()
    })

    expect(result.current.values).toEqual({
      label: 'Hello',
      variant: 'primary',
      disabled: false,
      size: 16,
    })
    expect(result.current.isDirty).toBe(false)
  })

  it('re-initialises when propControls reference changes', () => {
    const otherControls: PropDefinition[] = [
      { name: 'colour', label: 'Colour', controlType: 'colour', defaultValue: '#FF0000' },
    ]

    const { result, rerender } = renderHook(
      ({ controls }) => useControlValues(controls),
      { initialProps: { controls: sampleControls } }
    )

    // Modify a value
    act(() => {
      result.current.setValue('label', 'Modified')
    })
    expect(result.current.values.label).toBe('Modified')

    // Switch to different controls (simulates component navigation)
    rerender({ controls: otherControls })

    expect(result.current.values).toEqual({ colour: '#FF0000' })
    expect(result.current.isDirty).toBe(false)
  })

  describe('string[] (ControlValue) support', () => {
    const controlsWithArray: PropDefinition[] = [
      { name: 'tags', label: 'Tags', controlType: 'chip-array', defaultValue: ['alpha', 'beta'], maxItems: 5 },
      { name: 'label', label: 'Label', controlType: 'text', defaultValue: 'Hello' },
    ]

    it('initialises string[] default values correctly', () => {
      const { result } = renderHook(() => useControlValues(controlsWithArray))

      expect(result.current.values).toEqual({
        tags: ['alpha', 'beta'],
        label: 'Hello',
      })
    })

    it('isDirty is false when array value matches default by content', () => {
      const { result } = renderHook(() => useControlValues(controlsWithArray))

      expect(result.current.isDirty).toBe(false)
    })

    it('isDirty is true when array value differs from default', () => {
      const { result } = renderHook(() => useControlValues(controlsWithArray))

      act(() => {
        result.current.setValue('tags', ['alpha', 'beta', 'gamma'])
      })

      expect(result.current.isDirty).toBe(true)
    })

    it('isDirty is true when array elements are reordered', () => {
      const { result } = renderHook(() => useControlValues(controlsWithArray))

      act(() => {
        result.current.setValue('tags', ['beta', 'alpha'])
      })

      expect(result.current.isDirty).toBe(true)
    })

    it('isDirty is false after resetting array values', () => {
      const { result } = renderHook(() => useControlValues(controlsWithArray))

      act(() => {
        result.current.setValue('tags', ['changed'])
      })
      expect(result.current.isDirty).toBe(true)

      act(() => {
        result.current.resetAll()
      })
      expect(result.current.isDirty).toBe(false)
      expect(result.current.values.tags).toEqual(['alpha', 'beta'])
    })

    it('handles empty array default value', () => {
      const controls: PropDefinition[] = [
        { name: 'items', label: 'Items', controlType: 'chip-array', defaultValue: [], maxItems: 3 },
      ]
      const { result } = renderHook(() => useControlValues(controls))

      expect(result.current.values.items).toEqual([])
      expect(result.current.isDirty).toBe(false)

      act(() => {
        result.current.setValue('items', ['new'])
      })
      expect(result.current.isDirty).toBe(true)
    })

    it('returns empty values and isDirty false for undefined propControls', () => {
      const { result } = renderHook(() => useControlValues(undefined))

      expect(result.current.values).toEqual({})
      expect(result.current.isDirty).toBe(false)
    })
  })
})
