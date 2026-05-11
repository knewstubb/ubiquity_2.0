import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock the Supabase module globally so all providers use local data mode.
// AuthProvider will provide a mock user, DataLayerProvider will load seed data.
vi.mock('../lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: () => false,
}))
