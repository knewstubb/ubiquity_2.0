import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Node.js 22+ defines a getter for `localStorage` on globalThis that returns
// undefined unless --localstorage-file is provided. This interferes with
// jsdom's localStorage in the test environment. Provide a working in-memory
// Storage implementation for tests that uses Storage.prototype so that
// vi.spyOn(Storage.prototype, ...) works correctly.
if (typeof globalThis.localStorage === 'undefined' || globalThis.localStorage === null) {
  const store = new Map<string, string>()

  // Patch Storage.prototype methods to use our in-memory store
  Storage.prototype.getItem = function (key: string) {
    return store.get(key) ?? null
  }
  Storage.prototype.setItem = function (key: string, value: string) {
    store.set(key, String(value))
  }
  Storage.prototype.removeItem = function (key: string) {
    store.delete(key)
  }
  Storage.prototype.clear = function () {
    store.clear()
  }
  Storage.prototype.key = function (index: number) {
    return [...store.keys()][index] ?? null
  }
  Object.defineProperty(Storage.prototype, 'length', {
    get() { return store.size },
    configurable: true,
  })

  const storage = Object.create(Storage.prototype)
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    writable: true,
    configurable: true,
    enumerable: true,
  })
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: storage,
      writable: true,
      configurable: true,
      enumerable: true,
    })
  }
}

// Mock the Supabase module globally so all providers use local data mode.
// AuthProvider will provide a mock user, DataLayerProvider will load seed data.
vi.mock('../lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: () => false,
}))
