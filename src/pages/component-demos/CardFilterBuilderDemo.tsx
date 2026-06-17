import { useState } from 'react'
import { User, ShoppingCart, EnvelopeSimple, ChatCircleDots } from '@phosphor-icons/react'
import { ModalFilterBuilder } from '@/components/composed/filter-builder'
import type { SourceCategoryConfig, FilterGroup } from '@/components/composed/filter-builder'

const DEFAULT_SOURCE_CATEGORIES: SourceCategoryConfig[] = [
  // Contacts → Fields (direct, no sub-sources)
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
      { key: 'dob', label: 'Date of Birth', dataType: 'date' },
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
      {
        key: 'source',
        label: 'Source',
        dataType: 'enum',
        enumOptions: [
          { value: 'web', label: 'Web' },
          { value: 'import', label: 'Import' },
          { value: 'api', label: 'API' },
          { value: 'manual', label: 'Manual' },
        ],
      },
    ],
  },

  // Transactional → Table → Fields (1 level of sub-sources)
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
          { key: 'is_completed', label: 'Is Completed', dataType: 'boolean' },
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
          {
            key: 'category',
            label: 'Category',
            dataType: 'enum',
            enumOptions: [
              { value: 'electronics', label: 'Electronics' },
              { value: 'clothing', label: 'Clothing' },
              { value: 'food', label: 'Food' },
            ],
          },
        ],
      },
      {
        key: 'orders',
        label: 'Orders',
        fields: [
          { key: 'order_id', label: 'Order ID', dataType: 'text' },
          { key: 'order_total', label: 'Order Total', dataType: 'number' },
          { key: 'order_date', label: 'Order Date', dataType: 'date' },
          {
            key: 'order_status',
            label: 'Order Status',
            dataType: 'enum',
            enumOptions: [
              { value: 'pending', label: 'Pending' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ],
          },
        ],
      },
    ],
  },

  // Email → Folder → Mailout → Fields (2 levels of nesting)
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
              { key: 'open_count', label: 'Open Count', dataType: 'number' },
            ],
          },
          {
            key: 'monthly-newsletter',
            label: 'Monthly Newsletter',
            fields: [
              { key: 'sent_date', label: 'Sent Date', dataType: 'date' },
              { key: 'was_opened', label: 'Was Opened', dataType: 'boolean' },
              { key: 'was_clicked', label: 'Was Clicked', dataType: 'boolean' },
              { key: 'unsubscribed', label: 'Unsubscribed', dataType: 'boolean' },
            ],
          },
          {
            key: 'promo-blast',
            label: 'Promo Blast',
            fields: [
              { key: 'sent_date', label: 'Sent Date', dataType: 'date' },
              { key: 'was_opened', label: 'Was Opened', dataType: 'boolean' },
              { key: 'revenue_attributed', label: 'Revenue Attributed', dataType: 'number' },
            ],
          },
        ],
        fields: [],
      },
      {
        key: 'automations',
        label: 'Automations',
        subSources: [
          {
            key: 'abandoned-cart',
            label: 'Abandoned Cart',
            fields: [
              { key: 'triggered_date', label: 'Triggered Date', dataType: 'date' },
              { key: 'was_opened', label: 'Was Opened', dataType: 'boolean' },
              { key: 'converted', label: 'Converted', dataType: 'boolean' },
            ],
          },
          {
            key: 'birthday-email',
            label: 'Birthday Email',
            fields: [
              { key: 'triggered_date', label: 'Triggered Date', dataType: 'date' },
              { key: 'was_opened', label: 'Was Opened', dataType: 'boolean' },
              { key: 'was_clicked', label: 'Was Clicked', dataType: 'boolean' },
            ],
          },
        ],
        fields: [],
      },
      {
        key: 'transactional-emails',
        label: 'Transactional',
        subSources: [
          {
            key: 'order-confirmation',
            label: 'Order Confirmation',
            fields: [
              { key: 'sent_date', label: 'Sent Date', dataType: 'date' },
              { key: 'was_delivered', label: 'Was Delivered', dataType: 'boolean' },
            ],
          },
          {
            key: 'shipping-notification',
            label: 'Shipping Notification',
            fields: [
              { key: 'sent_date', label: 'Sent Date', dataType: 'date' },
              { key: 'was_delivered', label: 'Was Delivered', dataType: 'boolean' },
              { key: 'was_opened', label: 'Was Opened', dataType: 'boolean' },
            ],
          },
        ],
        fields: [],
      },
    ],
  },

  // SMS → Programme → Campaign → Fields (2 levels of nesting)
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
          {
            key: 'tier-upgrade',
            label: 'Tier Upgrade',
            fields: [
              { key: 'sent_date', label: 'Sent Date', dataType: 'date' },
              { key: 'was_delivered', label: 'Was Delivered', dataType: 'boolean' },
            ],
          },
        ],
        fields: [],
      },
      {
        key: 'sales-programme',
        label: 'Sales Programme',
        subSources: [
          {
            key: 'flash-sale',
            label: 'Flash Sale',
            fields: [
              { key: 'sent_date', label: 'Sent Date', dataType: 'date' },
              { key: 'was_delivered', label: 'Was Delivered', dataType: 'boolean' },
              { key: 'was_clicked', label: 'Was Clicked', dataType: 'boolean' },
              { key: 'conversion_value', label: 'Conversion Value', dataType: 'number' },
            ],
          },
          {
            key: 'seasonal-promo',
            label: 'Seasonal Promo',
            fields: [
              { key: 'sent_date', label: 'Sent Date', dataType: 'date' },
              { key: 'was_delivered', label: 'Was Delivered', dataType: 'boolean' },
              { key: 'opted_out', label: 'Opted Out', dataType: 'boolean' },
            ],
          },
        ],
        fields: [],
      },
      {
        key: 'service-programme',
        label: 'Service Programme',
        subSources: [
          {
            key: 'appointment-reminder',
            label: 'Appointment Reminder',
            fields: [
              { key: 'sent_date', label: 'Sent Date', dataType: 'date' },
              { key: 'was_delivered', label: 'Was Delivered', dataType: 'boolean' },
              { key: 'confirmed', label: 'Confirmed', dataType: 'boolean' },
            ],
          },
        ],
        fields: [],
      },
    ],
  },
]

const EMPTY_GROUP: FilterGroup = { logic: 'and', conditions: [] }

export default function CardFilterBuilderDemo(props: Record<string, unknown>) {
  const allowNesting = (props['allow-nesting'] as boolean) ?? true
  const maxDepth = (props['max-depth'] as number) ?? 3

  const [value, setValue] = useState<FilterGroup>(EMPTY_GROUP)

  return (
    <div className="w-full">
      <ModalFilterBuilder
        value={value}
        onChange={setValue}
        sourceCategories={DEFAULT_SOURCE_CATEGORIES}
        allowNesting={allowNesting}
        maxDepth={maxDepth}
      />
    </div>
  )
}
