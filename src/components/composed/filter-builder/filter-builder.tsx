import { InlineFilterBuilder } from './inline/inline-filter-builder'
import { ModalFilterBuilder } from './modal/modal-filter-builder'
import type { FilterFieldDef, FilterGroup, SourceCategoryConfig } from './types'

interface FilterBuilderBaseProps {
  value: FilterGroup
  onChange: (value: FilterGroup) => void
  allowNesting?: boolean
  maxDepth?: number
}

interface InlineFilterBuilderVariantProps extends FilterBuilderBaseProps {
  variant?: 'inline'
  fields?: FilterFieldDef[]
  sourceCategories?: SourceCategoryConfig[]
}

interface ModalFilterBuilderVariantProps extends FilterBuilderBaseProps {
  variant: 'modal'
  sourceCategories: SourceCategoryConfig[]
}

type FilterBuilderProps = InlineFilterBuilderVariantProps | ModalFilterBuilderVariantProps

export function FilterBuilder(props: FilterBuilderProps) {
  if (props.variant === 'modal') {
    return <ModalFilterBuilder {...props} />
  }
  return <InlineFilterBuilder {...props} />
}
