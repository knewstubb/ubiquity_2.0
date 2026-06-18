/**
 * @component DataSourceFilterStep
 * @description Wizard step for configuring data source filters using the
 * ModalFilterBuilder variant. Shows the filter builder with source categories
 * and a match count indicator at the bottom.
 *
 * Filter state is persisted to draft.dataSourceFilter so it survives step navigation.
 * A sourceConfig is derived from the first source category found in filter conditions
 * and written to draft.sourceConfig on each change.
 */

import { useCallback } from 'react'
import { User, ShoppingCart, EnvelopeSimple, ChatCircleDots } from '@phosphor-icons/react'
import { ModalFilterBuilder } from '@/components/composed/filter-builder'
import type { FilterGroup, SourceCategoryConfig, CardFilterRow } from '@/components/composed/filter-builder'
import type { ExporterWizardDraft } from '../../models/wizard'
import type { SourceConfig } from '../../models/source-selection'

interface DataSourceFilterStepProps {
  draft: ExporterWizardDraft
  onUpdate: (patch: Partial<ExporterWizardDraft>) => void
}

const SOURCE_CATEGORIES: SourceCategoryConfig[] = [
  {
    key: 'contacts',
    icon: <User size={20} weight="duotone" className="text-primary" />,
    title: 'Contacts',
    description: 'Contact profiles and attributes',
    fields: [
      { key: 'first_name', label: 'First Name', dataType: 'text' },
      { key: 'last_name', label: 'Last Name', dataType: 'text' },
      { key: 'email', label: 'Email', dataType: 'text' },
      { key: 'phone', label: 'Phone', dataType: 'text' },
      { key: 'created_at', label: 'Created At', dataType: 'date' },
      { key: 'last_modified', label: 'Last Modified', dataType: 'date' },
      { key: 'is_active', label: 'Is Active', dataType: 'boolean' },
      { key: 'is_verified', label: 'Is Verified', dataType: 'boolean' },
      {
        key: 'status',
        label: 'Status',
        dataType: 'enum',
        enumOptions: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'pending', label: 'Pending' },
        ],
      },
    ],
  },
  {
    key: 'transactional',
    icon: <ShoppingCart size={20} weight="duotone" className="text-primary" />,
    title: 'Transactional',
    description: 'Purchase and product data',
    fields: [],
    subSources: [
      {
        key: 'treatments',
        label: 'Treatments',
        fields: [
          { key: 'treatment_name', label: 'Treatment Name', dataType: 'text' },
          { key: 'treatment_amount', label: 'Treatment Amount', dataType: 'number' },
          { key: 'treatment_date', label: 'Treatment Date', dataType: 'date' },
        ],
      },
      {
        key: 'products',
        label: 'Products',
        fields: [
          { key: 'product_name', label: 'Product Name', dataType: 'text' },
          { key: 'quantity', label: 'Quantity', dataType: 'number' },
          { key: 'price', label: 'Price', dataType: 'number' },
          { key: 'purchase_date', label: 'Purchase Date', dataType: 'date' },
        ],
      },
    ],
  },
  {
    key: 'email',
    icon: <EnvelopeSimple size={20} weight="duotone" className="text-primary" />,
    title: 'Email',
    description: 'Email engagement and delivery data',
    fields: [],
    subSources: [
      {
        key: 'campaigns',
        label: 'Campaigns',
        subSources: [
          {
            key: 'welcome-series',
            label: 'Welcome Series',
            fields: [
              { key: 'sent_date', label: 'Sent Date', dataType: 'date' },
              { key: 'was_opened', label: 'Was Opened', dataType: 'boolean' },
              { key: 'was_clicked', label: 'Was Clicked', dataType: 'boolean' },
            ],
          },
          {
            key: 'monthly-newsletter',
            label: 'Monthly Newsletter',
            fields: [
              { key: 'sent_date', label: 'Sent Date', dataType: 'date' },
              { key: 'was_opened', label: 'Was Opened', dataType: 'boolean' },
            ],
          },
        ],
        fields: [],
      },
    ],
  },
  {
    key: 'sms',
    icon: <ChatCircleDots size={20} weight="duotone" className="text-primary" />,
    title: 'SMS',
    description: 'SMS messaging engagement data',
    fields: [],
    subSources: [
      {
        key: 'loyalty-programme',
        label: 'Loyalty Programme',
        subSources: [
          {
            key: 'points-reminder',
            label: 'Points Reminder',
            fields: [
              { key: 'sent_date', label: 'Sent Date', dataType: 'date' },
              { key: 'was_delivered', label: 'Was Delivered', dataType: 'boolean' },
            ],
          },
        ],
        fields: [],
      },
    ],
  },
]

const EMPTY_GROUP: FilterGroup = { logic: 'and', conditions: [] }

/**
 * Extracts unique source category keys from filter conditions.
 * Walks nested groups recursively.
 */
function extractSourceCategories(group: FilterGroup): Set<string> {
  const categories = new Set<string>()
  for (const condition of group.conditions) {
    if (condition.type === 'row') {
      const row = condition.row as CardFilterRow
      if (row.sourceCategory) {
        categories.add(row.sourceCategory)
      }
    } else if (condition.type === 'group') {
      for (const cat of extractSourceCategories(condition.group)) {
        categories.add(cat)
      }
    }
  }
  return categories
}

/**
 * Derives a SourceConfig from the source categories present in filter conditions.
 * Uses the first (primary) category found. Maps filter builder category keys
 * to the SourceConfig discriminated union.
 */
function deriveSourceConfig(group: FilterGroup): SourceConfig | null {
  const categories = extractSourceCategories(group)
  if (categories.size === 0) return null

  // Determine primary source from first category
  if (categories.has('contacts')) {
    return {
      primarySource: 'contacts',
      filter: { type: 'field_filter' },
      enrichment: categories.has('transactional')
        ? { entity: 'transactions', tableId: 'default', joinStrategy: 'most_recent' }
        : categories.has('email') || categories.has('sms')
          ? { entity: 'messages', channel: categories.has('email') ? 'email' : 'sms', statuses: [] }
          : null,
    }
  }

  if (categories.has('transactional')) {
    return {
      primarySource: 'transactions',
      tableId: 'default',
      filter: { type: 'field_filter' },
      enrichment: categories.has('contacts')
        ? { entity: 'contacts' }
        : null,
    }
  }

  if (categories.has('email')) {
    return {
      primarySource: 'messages',
      channels: ['email'],
      filter: { type: 'field_filter' },
      enrichment: categories.has('contacts')
        ? { entity: 'contacts' }
        : null,
    }
  }

  if (categories.has('sms')) {
    return {
      primarySource: 'messages',
      channels: ['sms'],
      filter: { type: 'field_filter' },
      enrichment: categories.has('contacts')
        ? { entity: 'contacts' }
        : null,
    }
  }

  return null
}

export function DataSourceFilterStep({ draft, onUpdate }: DataSourceFilterStepProps) {
  // Read filter state from draft (persisted) or default to empty
  const filterValue: FilterGroup = draft.dataSourceFilter ?? EMPTY_GROUP

  // Handle filter changes — persist to draft and derive sourceConfig
  const handleFilterChange = useCallback((newFilter: FilterGroup) => {
    const sourceConfig = deriveSourceConfig(newFilter)
    onUpdate({
      dataSourceFilter: newFilter,
      sourceConfig,
    })
  }, [onUpdate])

  // Match count simulation
  const conditionCount = filterValue.conditions.length
  const matchCount = conditionCount === 0 ? 12847 : Math.max(0, 12847 - conditionCount * 2341)

  return (
    <div className="flex flex-col flex-1 min-h-0" data-testid="data-source-filter-step">
      {/* Filter Builder — scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-gutter-stable">
        <ModalFilterBuilder
          value={filterValue}
          onChange={handleFilterChange}
          sourceCategories={SOURCE_CATEGORIES}
          allowNesting
          maxDepth={3}
        />
      </div>

      {/* Match Count Summary — fixed at bottom, outside scroll */}
      <div className="shrink-0 mt-4 pt-4 bg-card">
        <div className="flex items-center justify-between rounded-md bg-secondary/50 border border-border px-4 py-3">
          <span className="text-sm text-muted-foreground">Estimated records matching filters</span>
          <span className="text-sm font-semibold text-foreground">{matchCount.toLocaleString()} records</span>
        </div>
      </div>
    </div>
  )
}
