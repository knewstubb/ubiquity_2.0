import { useState, lazy, Suspense } from 'react'
import { User, ShoppingCart, EnvelopeSimple, ChatCircleDots } from '@phosphor-icons/react'
import { FilterBuilder, type FilterGroup, type FilterField, type SourceCategoryConfig } from '@/components/composed/filter-builder'

// Lazy-load the modal demo data (large source category config)
const ModalDemo = lazy(() => import('./CardFilterBuilderDemo'))

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

const INLINE_SOURCE_CATEGORIES: SourceCategoryConfig[] = [
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
      { key: 'is_active', label: 'Is Active', dataType: 'boolean' },
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
        key: 'products',
        label: 'Products',
        fields: [
          { key: 'product_name', label: 'Product Name', dataType: 'text' },
          { key: 'quantity', label: 'Quantity', dataType: 'number' },
          { key: 'price', label: 'Price', dataType: 'number' },
          { key: 'purchase_date', label: 'Purchase Date', dataType: 'date' },
        ],
      },
      {
        key: 'orders',
        label: 'Orders',
        fields: [
          { key: 'order_id', label: 'Order ID', dataType: 'text' },
          { key: 'order_total', label: 'Order Total', dataType: 'number' },
          { key: 'order_date', label: 'Order Date', dataType: 'date' },
        ],
      },
    ],
  },
  {
    key: 'email',
    icon: <EnvelopeSimple size={20} weight="duotone" className="text-primary" />,
    title: 'Email',
    description: 'Email engagement data',
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
              { key: 'unsubscribed', label: 'Unsubscribed', dataType: 'boolean' },
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
              { key: 'reply_received', label: 'Reply Received', dataType: 'boolean' },
            ],
          },
        ],
        fields: [],
      },
    ],
  },
]

const EMPTY_GROUP: FilterGroup = { logic: 'and', conditions: [] }

export default function FilterBuilderDemo(props: Record<string, unknown>) {
  const variant = (props.variant as string) ?? 'inline'
  const fieldSet = (props['field-set'] as string) ?? 'all-types'
  const allowNesting = (props['allow-nesting'] as boolean) ?? true
  const maxDepth = (props['max-depth'] as number) ?? 3

  // Modal variant — delegate to the CardFilterBuilderDemo which has the source categories
  if (variant === 'modal') {
    return (
      <div className="w-full p-6">
        <Suspense fallback={<div className="text-sm text-muted-foreground p-4">Loading...</div>}>
          <ModalDemo allow-nesting={allowNesting} max-depth={maxDepth} />
        </Suspense>
      </div>
    )
  }

  // Inline variant
  const fields = FIELD_SETS[fieldSet] ?? ALL_TYPES_FIELDS
  const [value, setValue] = useState<FilterGroup>(EMPTY_GROUP)

  // Use sourceCategories when field-set is 'source-categories'
  if (fieldSet === 'source-categories') {
    return (
      <div className="w-full p-6">
        <FilterBuilder
          sourceCategories={INLINE_SOURCE_CATEGORIES}
          value={value}
          onChange={setValue}
          allowNesting={allowNesting}
          maxDepth={maxDepth}
        />
      </div>
    )
  }

  return (
    <div className="w-full p-6">
      <FilterBuilder
        fields={fields}
        value={value}
        onChange={setValue}
        allowNesting={allowNesting}
        maxDepth={maxDepth}
      />
    </div>
  )
}
