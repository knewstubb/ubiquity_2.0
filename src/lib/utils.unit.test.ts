import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn() utility', () => {
  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('')
  })

  it('passes through a single class', () => {
    expect(cn('p-4')).toBe('p-4')
  })

  it('merges multiple non-conflicting classes', () => {
    expect(cn('p-4', 'text-red-500')).toBe('p-4 text-red-500')
  })

  it('filters out falsy values', () => {
    expect(cn('p-4', false && 'hidden', undefined, null, '')).toBe('p-4')
  })

  it('resolves Tailwind padding conflicts (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('resolves Tailwind text-size conflicts (last wins)', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })

  it('supports object syntax with conditional classes', () => {
    expect(cn({ 'p-4': true, hidden: false })).toBe('p-4')
  })

  it('supports array syntax', () => {
    expect(cn(['p-4', 'text-sm'])).toBe('p-4 text-sm')
  })
})
