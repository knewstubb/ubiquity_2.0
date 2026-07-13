/**
 * @component DataSourceFilterStep
 * @description Wizard step for configuring data source filters using the
 * ModalFilterBuilder. Shows the filter builder with source categories
 * and a match count indicator at the bottom.
 *
 * Filter state is persisted to draft.dataSourceFilter so it survives step navigation.
 * A sourceConfig is derived from the first source category found in filter conditions
 * and written to draft.sourceConfig on each change.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { User, ShoppingCart, EnvelopeSimple, ChatCircleDots, BookmarkSimple, Trash, TrendDown, ArrowsClockwise, Funnel, CaretLeft, ClipboardText, ListChecks, CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { SelectorCard } from '@/components/composed/selector-card'
import { InfoHint } from '@/components/composed/info-hint'
import { HelpPopover } from '@/components/composed/help-popover'
import { ModalFilterBuilder } from '@/components/composed/filter-builder'
import type { FilterGroup, SourceCategoryConfig, CardFilterRow } from '@/components/composed/filter-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePrototypePhases } from '../../contexts/PrototypePhaseContext'
import { useAccount } from '../../contexts/AccountContext'
import { transactionalDatabases } from '../../data/transactionalData'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
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
        sourceType: 'transactional',
        fields: [
          { key: 'treatment_name', label: 'Treatment Name', dataType: 'text' },
          { key: 'treatment_amount', label: 'Treatment Amount', dataType: 'number' },
          { key: 'treatment_date', label: 'Treatment Date', dataType: 'date' },
        ],
      },
      {
        key: 'products',
        label: 'Products',
        sourceType: 'transactional',
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
  const { phases } = usePrototypePhases()
  const exporterPhase = phases.exporterPhase
  const { selectedAccount } = useAccount()

  // Read filter state from draft (persisted) or default to empty
  const filterValue: FilterGroup = draft.dataSourceFilter ?? EMPTY_GROUP

  const [dataSourceMode, setDataSourceMode] = useState<'all_changes' | 'filtered' | 'mailout' | null>(
    draft.dataSourceMode ?? null
  )
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false)

  // Track previous phase to only reset on actual phase changes, not on mount
  const prevPhaseRef = useRef(exporterPhase)

  // React to phase changes — reset mode only when phase actually changes
  useEffect(() => {
    if (prevPhaseRef.current === exporterPhase) return
    prevPhaseRef.current = exporterPhase

    // Reset card selection when phase changes
    setDataSourceMode(null)
    onUpdate({ dataSourceMode: null, sourceConfig: null })
  }, [exporterPhase])

  // Handle mode selection
  function handleSelectMode(mode: 'all_changes' | 'filtered' | 'mailout') {
    setDataSourceMode(mode)
    if (mode === 'all_changes') {
      // Set a default contacts source config so field mapping has fields to show
      onUpdate({
        dataSourceMode: mode,
        sourceConfig: {
          primarySource: 'contacts',
          filter: { type: 'field_filter', fieldFilters: [] },
          enrichment: null,
          enrichments: [],
        },
      })
    } else if (mode === 'mailout') {
      // Set mailout as primary source with messages enrichment option
      onUpdate({
        dataSourceMode: mode,
        sourceConfig: {
          primarySource: 'messages',
          channels: ['email'] as ('email' | 'sms' | 'push')[],
          filter: { type: 'field_filter', fieldFilters: [] },
          enrichment: null,
          enrichments: [],
        },
      })
    } else {
      onUpdate({ dataSourceMode: mode })
    }
  }

  function handleChangeMode() {
    setDataSourceMode(null)
    onUpdate({ dataSourceMode: null, sourceConfig: null })
  }

  // Phase 1: select contacts as primary source
  function handleSelectContacts() {
    setDataSourceMode('all_changes')
    onUpdate({
      dataSourceMode: 'all_changes',
      sourceConfig: {
        primarySource: 'contacts',
        filter: { type: 'field_filter', fieldFilters: [] },
        enrichment: null,
        enrichments: [],
      },
    })
  }

  // Phase 1: select transactional as primary source with a specific table
  function handleSelectTransactional(tableId: string) {
    setDataSourceMode('all_changes')
    onUpdate({
      dataSourceMode: 'all_changes',
      sourceConfig: {
        primarySource: 'transactions',
        tableId,
        filter: { type: 'field_filter', fieldFilters: [] },
        enrichment: null,
        enrichments: [],
      },
    })
  }

  // Handle filter changes — persist to draft and derive sourceConfig
  const handleFilterChange = useCallback((newFilter: FilterGroup) => {
    const sourceConfig = deriveSourceConfig(newFilter)
    onUpdate({
      dataSourceFilter: newFilter,
      sourceConfig,
    })
  }, [onUpdate])

  // Count total conditions and groups (for limits display)
  const { totalConditions, totalGroups } = useMemo(() => {
    let conditions = 0
    let groups = 0
    function walk(group: FilterGroup) {
      for (const c of group.conditions) {
        if (c.type === 'row') {
          conditions++
        } else {
          groups++
          walk(c.group)
        }
      }
    }
    walk(filterValue)
    return { totalConditions: conditions, totalGroups: groups }
  }, [filterValue])

  const MAX_CONDITIONS = 25
  const MAX_GROUPS = 10
  const conditionsNearLimit = totalConditions >= MAX_CONDITIONS * 0.8
  const groupsNearLimit = totalGroups >= MAX_GROUPS * 0.8

  // Mock match count — decreases as conditions are added
  const matchCount = totalConditions === 0 ? 12847 : Math.max(0, 12847 - totalConditions * 2341)

  // Count colour styles
  const conditionCountColour = totalConditions >= MAX_CONDITIONS
    ? "text-destructive"
    : conditionsNearLimit
      ? "text-amber-600"
      : "text-foreground"

  const groupCountColour = totalGroups >= MAX_GROUPS
    ? "text-destructive"
    : groupsNearLimit
      ? "text-amber-600"
      : "text-foreground"

  // Clear all handler
  function handleClearAllConfirm() {
    onUpdate({ dataSourceFilter: EMPTY_GROUP, sourceConfig: null })
    setClearAllDialogOpen(false)
  }

  // Save template handler
  function handleSaveTemplate() {
    toast.success('Template saved')
    setTemplateDialogOpen(false)
    setTemplateName('')
  }

  return (
    <div className="flex flex-col flex-1 min-h-0" data-testid="data-source-filter-step">
      {/* Mode selection or active mode content */}
      {(dataSourceMode !== 'filtered') ? (
        /* Card selectors — show cards with selection state */
        <div className="flex flex-col gap-4 px-4 pt-2">

          {exporterPhase === 1 ? (
            /* Phase 1: Contacts or Transactional table — option card list */
            <div className="flex items-start gap-14 w-full">
              <div className="w-40 shrink-0">
                <div className="flex items-center gap-1.5"><p className="text-sm font-semibold text-foreground m-0">Source</p><HelpPopover title="Primary Source" body="Choose the base table your export is built around. Each export run will include records from this source that have changed since the last run. You can add fields from other sources on the next step." width="default" /></div>
                <p className="text-xs text-tertiary-foreground mt-1 m-0">What data to export</p>
              </div>
              <div className="w-[552px] flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide m-0">Contacts</p>
                  <SelectorCard
                    variant="option"
                    icon={<User size={20} weight="regular" className="text-primary" />}
                    label={selectedAccount.name}
                    description="Profile and attribute data"
                    selected={draft.sourceConfig?.primarySource === 'contacts'}
                    onSelect={handleSelectContacts}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide m-0">Transactional</p>
                  {transactionalDatabases.map((table) => (
                    <SelectorCard
                      key={table.id}
                      variant="option"
                      icon={<ShoppingCart size={20} weight="regular" className="text-primary" />}
                      label={table.name}
                      description="Purchase and activity data"
                      selected={draft.sourceConfig?.primarySource === 'transactions' && (draft.sourceConfig as { tableId?: string }).tableId === table.id}
                      onSelect={() => handleSelectTransactional(table.id)}
                    />
                  ))}
                </div>
                <InfoHint>
                  Exports include records changed since the previous export. First export includes the last 24 hours.
                </InfoHint>
              </div>
            </div>
          ) : exporterPhase === 2 ? (
            /* Phase 2: Contacts + Messaging + Transactional */
            <div className="flex items-start gap-14 w-full">
              <div className="w-40 shrink-0">
                <div className="flex items-center gap-1.5"><p className="text-sm font-semibold text-foreground m-0">Source</p><HelpPopover title="Primary Source" body="Choose the base table your export is built around. Each export run will include records from this source that have changed since the last run. You can add fields from other sources on the next step." width="default" /></div>
                <p className="text-xs text-tertiary-foreground mt-1 m-0">What data to export</p>
              </div>
              <div className="w-[552px] flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide m-0">Contacts</p>
                  <SelectorCard
                    variant="option"
                    icon={<User size={20} weight="regular" className="text-primary" />}
                    label={selectedAccount.name}
                    description="Profile and attribute data"
                    selected={draft.sourceConfig?.primarySource === 'contacts'}
                    onSelect={handleSelectContacts}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide m-0">Messaging</p>
                  <SelectorCard
                    variant="option"
                    icon={<EnvelopeSimple size={20} weight="regular" className="text-primary" />}
                    label="Mailout"
                    description="Email send and engagement data"
                    selected={draft.sourceConfig?.primarySource === 'messages'}
                    onSelect={() => handleSelectMode('mailout')}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide m-0">Transactional</p>
                  {transactionalDatabases.map((table) => (
                    <SelectorCard
                      key={table.id}
                      variant="option"
                      icon={<ShoppingCart size={20} weight="regular" className="text-primary" />}
                      label={table.name}
                      description="Purchase and activity data"
                      selected={draft.sourceConfig?.primarySource === 'transactions' && (draft.sourceConfig as { tableId?: string }).tableId === table.id}
                      onSelect={() => handleSelectTransactional(table.id)}
                    />
                  ))}
                </div>
                <InfoHint>
                  Exports include records changed since the previous export. First export includes the last 24 hours.
                </InfoHint>
              </div>
            </div>
          ) : (
            /* Phase 3: Contacts + Transactional + Mailout + Surveys, Forms, SMS */
            <div className="flex items-start gap-14 w-full">
              <div className="w-40 shrink-0">
                <div className="flex items-center gap-1.5"><p className="text-sm font-semibold text-foreground m-0">Source</p><HelpPopover title="Primary Source" body="Choose the base table your export is built around. Each export run will include records from this source that have changed since the last run. You can add fields from other sources on the next step." width="default" /></div>
                <p className="text-xs text-tertiary-foreground mt-1 m-0">What data to export</p>
              </div>
              <div className="w-[552px] flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide m-0">Contacts</p>
                  <SelectorCard
                    variant="option"
                    icon={<User size={20} weight="regular" className="text-primary" />}
                    label={selectedAccount.name}
                    description="Profile and attribute data"
                    selected={draft.sourceConfig?.primarySource === 'contacts'}
                    onSelect={handleSelectContacts}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide m-0">Messaging</p>
                  <SelectorCard
                    variant="option"
                    icon={<EnvelopeSimple size={20} weight="regular" className="text-primary" />}
                    label="Mailout"
                    description="Email send and engagement data"
                    selected={draft.sourceConfig?.primarySource === 'messages'}
                    onSelect={() => handleSelectMode('mailout')}
                  />
                  <SelectorCard
                    variant="option"
                    icon={<ChatCircleDots size={20} weight="regular" className="text-primary" />}
                    label="SMS"
                    description="SMS delivery and engagement data"
                    selected={false}
                    disabled
                    onSelect={() => {}}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide m-0">Transactional</p>
                  {transactionalDatabases.map((table) => (
                    <SelectorCard
                      key={table.id}
                      variant="option"
                      icon={<ShoppingCart size={20} weight="regular" className="text-primary" />}
                      label={table.name}
                      description="Purchase and activity data"
                      selected={draft.sourceConfig?.primarySource === 'transactions' && (draft.sourceConfig as { tableId?: string }).tableId === table.id}
                      onSelect={() => handleSelectTransactional(table.id)}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide m-0">Data Capture</p>
                  <SelectorCard
                    variant="option"
                    icon={<ListChecks size={20} weight="regular" className="text-primary" />}
                    label="Surveys"
                    description="Survey response and completion data"
                    selected={false}
                    disabled
                    onSelect={() => {}}
                  />
                  <SelectorCard
                    variant="option"
                    icon={<ClipboardText size={20} weight="regular" className="text-primary" />}
                    label="Forms"
                    description="Form submission and field data"
                    selected={false}
                    disabled
                    onSelect={() => {}}
                  />
                </div>
                <InfoHint>
                  Exports include records changed since the previous export. First export includes the last 24 hours.
                </InfoHint>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Filter view — shows empty state or filter builder (Phase 3 only) */
        <div className="flex-1 flex flex-col min-h-0 rounded-lg border border-border overflow-hidden">
          {/* Top bar — white bg, border bottom (Phase 3 only, for filter actions) */}
          {exporterPhase >= 3 && (
          <div className="shrink-0 flex items-center justify-end gap-3 px-4 py-2 bg-background border-b border-border">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setClearAllDialogOpen(true)}
                  disabled={totalConditions === 0}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash size={14} weight="regular" />
                  Clear all
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setTemplateDialogOpen(true)}
                  disabled={totalConditions === 0}
                >
                  <BookmarkSimple size={14} weight="regular" />
                  Save as template
                </Button>
              </div>
          </div>
          )}

          {/* Content — empty state or filter builder */}
          {exporterPhase >= 3 ? (
            /* Phase 3: full filter builder with custom empty state */
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-gutter-stable px-4 bg-surface flex flex-col">
              <ModalFilterBuilder
                value={filterValue}
                onChange={handleFilterChange}
                sourceCategories={SOURCE_CATEGORIES}
                allowNesting
                maxDepth={3}
                maxConditions={MAX_CONDITIONS}
                maxGroups={MAX_GROUPS}
                emptyState={
                  <div className="text-center max-w-sm">
                    <CheckCircle size={32} weight="regular" className="text-primary mx-auto mb-3" />
                    <p className="text-base font-semibold text-foreground m-0">All changed records will be exported</p>
                    <p className="text-sm text-muted-foreground mt-2 m-0">
                      Only records created or modified since the last run are included. Click next to continue or add a filter to export a subset.
                    </p>
                  </div>
                }
              />
            </div>
          ) : (
            /* Phase 1–2: informational — delta export, no filter editing */
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 bg-surface">
              <div className="flex flex-col items-center gap-3 text-center max-w-sm">
                <CheckCircle size={32} weight="regular" className="text-primary" />
                <p className="text-base font-semibold text-foreground m-0">All changed records will be exported</p>
                <p className="text-sm text-muted-foreground m-0">
                  Only records created or modified since the last run are included. Click next to continue.
                </p>
              </div>
            </div>
          )}

          {/* Footer — conditions and groups counter */}
          {exporterPhase >= 3 && totalConditions > 0 && (
            <div className="shrink-0 border-t border-border px-4 py-3 bg-background">
              <div className="flex items-center gap-6">
                <span className="text-sm text-muted-foreground">
                  Conditions <span className={cn("font-semibold", conditionCountColour)}>{totalConditions}/{MAX_CONDITIONS}</span>
                </span>
                <span className="text-sm text-muted-foreground">
                  Groups <span className={cn("font-semibold", groupCountColour)}>{totalGroups}/{MAX_GROUPS}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save as template dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as template</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <DialogDescription className="text-sm">
              Give your filter template a name so you can reuse it later.
            </DialogDescription>
            <Input
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondaryGhost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear all confirmation dialog */}
      <AlertDialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all conditions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all filter conditions and groups. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
