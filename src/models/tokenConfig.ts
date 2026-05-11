/** A Tailwind primitive reference: "{palette}-{shade}" */
export type PrimitiveRef = `${string}-${string}`;

export interface ColourTokenValue {
  light: PrimitiveRef;
  dark: PrimitiveRef;
}

export interface TokenConfig {
  colours: Record<string, ColourTokenValue>;
  spacing: Record<string, number>; // px values
  radius: { base: number }; // derived values computed from base
  typography: {
    fontSizes: Record<string, number>; // px values
  };
}

/** The full Tailwind palette lookup table */
export type PaletteLookup = Record<string, Record<string, string>>;

export interface UseTokenConfigReturn {
  config: TokenConfig;
  updateColour: (tokenName: string, mode: 'light' | 'dark', value: PrimitiveRef) => void;
  updateSpacing: (tokenName: string, value: number) => void;
  updateRadius: (base: number) => void;
  updateFontSize: (tokenName: string, value: number) => void;
  reset: () => void;
  exportJSON: () => void;
}
