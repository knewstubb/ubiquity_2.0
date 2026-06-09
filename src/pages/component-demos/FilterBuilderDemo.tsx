import { useState } from 'react'
import { FilterBuilder, type FilterRow, type FilterField } from '@/components/composed/filter-builder'

/** All standard data types represented */
const ALL_TYPES_FIELDS: FilterField[] = [
  { key: 'name', label: 'Name', dataType: 'text' },
  { key: 'email', label: 'Email', dataType: 'text' },
  { key: 'age', label: 'Age', dataType: 'number' },
  { key: 'total_spend', label: 'Total Spend', dataType: 'number' },
  { key: 'created_date', label: 'Created Date', dataType: 'date' },
  { key: 'last_modified', label: 'Last Modified', dataType: 'date' },
  { key: 'is_active', label: 'Is Active', dataType: 'boolean' },
  { key: 'is_verified', label: 'Is Verified', dataType: 'boolean' },
  { key: 'status', label: 'Status', dataType: 'enum', enumOptions: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
  ]},
  { key: 'source', label: 'Source', dataType: 'enum', enumOptions: [
    { value: 'web', label: 'Web' },
    { value: 'import', label: 'Import' },
    { value: 'api', label: 'API' },
    { value: 'manual', label: 'Manual' },
  ]},
  { key: 'membership_tier', label: 'Membership Tier', dataType: 'enum', enumOptions: [
    { value: 'bronze', label: 'Bronze' },
    { value: 'silver', label: 'Silver' },
    { value: 'gold', label: 'Gold' },
    { value: 'platinum', label: 'Platinum' },
  ]},
]

const CONTACT_SYSTEM_FIELDS: FilterField[] = [
  { key: 'id', label: 'ID', dataType: 'text' },
  { key: 'reference_id', label: 'Reference ID', dataType: 'text' },
  { key: 'person_id', label: 'Person ID', dataType: 'text' },
  { key: 'create_date', label: 'Create Date', dataType: 'date' },
  { key: 'last_modified', label: 'Last Modified', dataType: 'date' },
  { key: 'source', label: 'Source', dataType: 'enum', enumOptions: [
    { value: 'web', label: 'Web' },
    { value: 'import', label: 'Import' },
    { value: 'api', label: 'API' },
  ]},
  { key: 'version', label: 'Version', dataType: 'number' },
]

const MESSAGE_FIELDS: FilterField[] = [
  { key: 'was_included', label: 'Was included', dataType: 'boolean' },
  { key: 'is_read', label: 'Is read', dataType: 'boolean' },
  { key: 'has_clicked', label: 'Has clicked', dataType: 'boolean' },
  { key: 'is_opted_out', label: 'Is opted out', dataType: 'boolean' },
  { key: 'message_status', label: 'Message status', dataType: 'enum', enumOptions: [
    { value: 'delivered', label: 'Delivered' },
    { value: 'bounced', label: 'Bounced' },
    { value: 'failed', label: 'Failed' },
    { value: 'opened', label: 'Opened' },
  ]},
  { key: 'marked_as_spam', label: 'Marked as spam', dataType: 'boolean' },
  { key: 'is_read_more_than_once', label: 'Is read more than once', dataType: 'boolean' },
  { key: 'read_on', label: 'Read on', dataType: 'date' },
  { key: 'read_first_on', label: 'Read first on', dataType: 'date' },
]

const FIELD_SETS: Record<string, FilterField[]> = {
  'all-types': ALL_TYPES_FIELDS,
  'contacts': CONTACT_SYSTEM_FIELDS,
  'messages': MESSAGE_FIELDS,
}

export default function FilterBuilderDemo(props: Record<string, unknown>) {
  const fieldSet = (props['field-set'] as string) ?? 'all-types'
  const maxRows = (props['max-rows'] as number) ?? 5

  const fields = FIELD_SETS[fieldSet] ?? ALL_TYPES_FIELDS

  const [rows, setRows] = useState<FilterRow[]>([{ field: '', operator: '', value: '' }])
  const [logic, setLogic] = useState<'and' | 'or'>('and')

  return (
    <div className="w-full">
      <FilterBuilder
        fields={fields}
        rows={rows}
        onChange={setRows}
        logic={logic}
        onLogicChange={setLogic}
        maxRows={maxRows}
      />
    </div>
  )
}
