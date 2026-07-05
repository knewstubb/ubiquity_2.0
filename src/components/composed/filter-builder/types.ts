/**
 * Shared type definitions for the Filter Builder component.
 *
 * Core filter types (FilterGroup, FilterCondition, FilterLogic) are defined here
 * as the single source of truth. The component extends these with source
 * category configuration and card filter row types.
 */

// ─── Core Filter Types ───────────────────────────────────────────────────────

export type FieldDataType = 'text' | 'number' | 'date' | 'boolean' | 'enum'
export type FilterLogic = 'and' | 'or'

export interface FilterFieldDef {
  key: string
  label: string
  dataType: FieldDataType
  enumOptions?: { value: string; label: string }[]
}

/**
 * @deprecated Use FilterFieldDef instead. This alias exists for backwards compatibility.
 */
export type FilterField = FilterFieldDef

export interface FilterRow {
  field: string
  operator: string
  value: string
}

export interface FilterGroup {
  logic: FilterLogic
  conditions: FilterCondition[]
}

export type FilterCondition =
  | { type: 'row'; row: FilterRow | CardFilterRow }
  | { type: 'group'; group: FilterGroup }

// ─── Source Category Configuration (Modal variant) ───────────────────────────

export interface SourceCategoryConfig {
  key: string
  icon: React.ReactNode
  title: string
  description: string
  subSources?: SubSourceConfig[]
  fields: FilterFieldDef[]
}

export interface SubSourceConfig {
  key: string
  label: string
  fields: FilterFieldDef[]
  subSources?: SubSourceConfig[]
  sourceType?: 'transactional' // marks this sub-source as a transactional table
}

// ─── Card Filter Row (Modal variant) ─────────────────────────────────────────

export interface CardFilterRow {
  sourceCategory: string
  subSource: string | null
  field: string
  operator: string
  value: string | number | boolean | null | [string, string] | string[]
  dateMode: 'specific' | 'anniversary' | 'same_day' | null
  disabled?: boolean
  subFilters?: FilterGroup | null // nested conditions for "has matching" / "does not have matching"
  aggregate?: AggregateCondition | null // "And those transactions have" section
}

// ─── Aggregate Condition ─────────────────────────────────────────────────────

export type AggregateType = 'number_of_rows' | 'total_value' | 'highest_value' | 'lowest_value' | 'average'

export interface AggregateFieldRow {
  field: string | null
  operator: string
  value: string
}

export interface AggregateCondition {
  type: AggregateType
  field?: string | null // which numeric field to aggregate (not needed for number_of_rows)
  operator: string // equals, greater_than, less_than, etc.
  value: string // numeric value
  additionalFields?: AggregateFieldRow[] // extra field conditions within aggregate
}

// ─── Modal State ─────────────────────────────────────────────────────────────

export interface ModalState {
  mode: 'add' | 'edit'
  step: 1 | 2 | 3 | 4
  sourceCategory: string | null
  subSource: string | null
  field: string | null
  operator: string | null
  value: string | number | boolean | null | [string, string] | string[]
  dateMode: 'specific' | 'anniversary' | 'same_day' | null
  editIndex: number | null
}

// ─── Props API ───────────────────────────────────────────────────────────────

export interface ModalFilterBuilderProps {
  value: FilterGroup
  onChange: (value: FilterGroup) => void
  sourceCategories: SourceCategoryConfig[]
  allowNesting?: boolean
  maxDepth?: number
  maxConditions?: number
  maxGroups?: number
}
