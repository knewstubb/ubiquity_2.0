import { useParams, Navigate } from 'react-router-dom'
import { useTokenConfigContext } from '../../contexts/TokenConfigContext'
import { ColourSection } from '../../components/tokens/ColourSection'
import { TypographySection } from '../../components/tokens/TypographySection'
import { SpacingSection } from '../../components/tokens/SpacingSection'
import { RadiusSection } from '../../components/tokens/RadiusSection'
import { SizingSection } from '../../components/tokens/SizingSection'
import { IconSection } from '../../components/tokens/IconSection'
import { ActionBar } from '../../components/tokens/ActionBar'
import ShadowsDemo from './ShadowsDemo'

// Maps URL slugs to human-readable page titles
const SLUG_TITLES: Record<string, string> = {
  colours: 'Colours',
  typography: 'Typography',
  shadows: 'Shadows',
  spacing: 'Spacing',
  radius: 'Radius',
  sizing: 'Sizing & Borders',
  icons: 'Icons',
}

const VALID_SLUGS = Object.keys(SLUG_TITLES)

export default function TokenSubPage() {
  const { tokenSlug } = useParams<{ tokenSlug: string }>()
  const { config, updateColour, updateSpacing, updateRadius, updateFontSize, reset, exportJSON } =
    useTokenConfigContext()

  // Redirect to colours if slug is invalid
  if (!tokenSlug || !VALID_SLUGS.includes(tokenSlug)) {
    return <Navigate to="/admin/components/tokens/colours" replace />
  }

  const title = SLUG_TITLES[tokenSlug]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground m-0">
        {title}
      </h1>

      <div className="flex flex-col gap-6">
        {tokenSlug === 'colours' && (
          <ColourSection config={config} onUpdateColour={updateColour} />
        )}

        {tokenSlug === 'typography' && (
          <TypographySection config={config} onUpdateFontSize={updateFontSize} />
        )}

        {tokenSlug === 'shadows' && (
          <ShadowsDemo />
        )}

        {tokenSlug === 'spacing' && (
          <SpacingSection config={config} onUpdateSpacing={updateSpacing} />
        )}

        {tokenSlug === 'radius' && (
          <RadiusSection config={config} onUpdateRadius={updateRadius} />
        )}

        {tokenSlug === 'sizing' && (
          <SizingSection />
        )}

        {tokenSlug === 'icons' && (
          <IconSection />
        )}
      </div>

      <ActionBar onReset={reset} onExport={exportJSON} />
    </div>
  )
}
