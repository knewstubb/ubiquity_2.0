import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useTokenConfig } from '../lib/useTokenConfig'
import type { TokenConfig, PrimitiveRef, UseTokenConfigReturn } from '../models/tokenConfig'

// Re-export the interface for consumers that need the type
export type TokenConfigContextValue = UseTokenConfigReturn

const TokenConfigContext = createContext<TokenConfigContextValue | null>(null)

/**
 * Provides token configuration state to all token sub-pages.
 * Wraps the existing useTokenConfig() hook so that edits persist
 * across navigation between token sub-pages for the session duration.
 */
export function TokenConfigProvider({ children }: { children: ReactNode }) {
  const tokenConfig = useTokenConfig()

  return (
    <TokenConfigContext.Provider value={tokenConfig}>
      {children}
    </TokenConfigContext.Provider>
  )
}

/**
 * Consumes the token config context. Must be used within a TokenConfigProvider.
 * Returns: config, updateColour, updateSpacing, updateRadius, updateFontSize, reset, exportJSON
 */
export function useTokenConfigContext(): TokenConfigContextValue {
  const ctx = useContext(TokenConfigContext)
  if (!ctx) {
    throw new Error('useTokenConfigContext must be used within a TokenConfigProvider')
  }
  return ctx
}
