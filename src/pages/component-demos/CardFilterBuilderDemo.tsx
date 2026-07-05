import { useState, useMemo } from 'react'
import { UsersThree, Table, EnvelopeSimple, ChatCentered, Confetti, ClipboardText, ListChecks, Bell, Funnel as FunnelIcon, BookmarkSimple, TrendDown, Trash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { ModalFilterBuilder } from '@/components/composed/filter-builder'
import type { SourceCategoryConfig, FilterGroup } from '@/components/composed/filter-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

const DEFAULT_SOURCE_CATEGORIES: SourceCategoryConfig[] = [
  // Contacts → Fields (direct, no sub-sources)
  {
    key: 'contacts',
    icon: <UsersThree size={20} weight="duotone" className="text-primary" />,
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
    icon: <Table size={20} weight="duotone" className="text-primary" />,
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
          { key: 'is_completed', label: 'Is Completed', dataType: 'boolean' },
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
        sourceType: 'transactional',
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
    icon: <ChatCentered size={20} weight="duotone" className="text-primary" />,
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

  // Events → Event → Fields (relationship-based)
  {
    key: 'events',
    icon: <Confetti size={20} weight="duotone" className="text-primary" />,
    title: 'Events',
    description: 'Event registrations and attendance',
    fields: [],
    subSources: [
      {
        key: 'summer-gala-2025',
        label: 'Summer Gala 2025',
        sourceType: 'transactional',
        fields: [
          { key: 'registration_date', label: 'Registration Date', dataType: 'date' },
          { key: 'attended', label: 'Attended', dataType: 'boolean' },
          { key: 'ticket_type', label: 'Ticket Type', dataType: 'enum', enumOptions: [
            { value: 'general', label: 'General Admission' },
            { value: 'vip', label: 'VIP' },
            { value: 'early_bird', label: 'Early Bird' },
          ]},
        ],
      },
      {
        key: 'product-launch-webinar',
        label: 'Product Launch Webinar',
        sourceType: 'transactional',
        fields: [
          { key: 'registered_date', label: 'Registered Date', dataType: 'date' },
          { key: 'attended', label: 'Attended', dataType: 'boolean' },
          { key: 'watch_duration_mins', label: 'Watch Duration (mins)', dataType: 'number' },
        ],
      },
      {
        key: 'monthly-meetup',
        label: 'Monthly Meetup',
        sourceType: 'transactional',
        fields: [
          { key: 'rsvp_date', label: 'RSVP Date', dataType: 'date' },
          { key: 'attended', label: 'Attended', dataType: 'boolean' },
          { key: 'feedback_score', label: 'Feedback Score', dataType: 'number' },
        ],
      },
    ],
  },

  // Surveys → Survey → Fields (relationship-based)
  {
    key: 'surveys',
    icon: <ClipboardText size={20} weight="duotone" className="text-primary" />,
    title: 'Surveys',
    description: 'Survey responses and completion data',
    fields: [],
    subSources: [
      {
        key: 'nps-q1-2025',
        label: 'NPS Survey Q1 2025',
        sourceType: 'transactional',
        fields: [
          { key: 'completed_date', label: 'Completed Date', dataType: 'date' },
          { key: 'nps_score', label: 'NPS Score', dataType: 'number' },
          { key: 'feedback_text', label: 'Feedback', dataType: 'text' },
        ],
      },
      {
        key: 'product-satisfaction',
        label: 'Product Satisfaction',
        sourceType: 'transactional',
        fields: [
          { key: 'completed_date', label: 'Completed Date', dataType: 'date' },
          { key: 'overall_rating', label: 'Overall Rating', dataType: 'number' },
          { key: 'would_recommend', label: 'Would Recommend', dataType: 'boolean' },
        ],
      },
      {
        key: 'onboarding-feedback',
        label: 'Onboarding Feedback',
        sourceType: 'transactional',
        fields: [
          { key: 'submitted_date', label: 'Submitted Date', dataType: 'date' },
          { key: 'ease_of_use', label: 'Ease of Use', dataType: 'enum', enumOptions: [
            { value: 'very_easy', label: 'Very Easy' },
            { value: 'easy', label: 'Easy' },
            { value: 'neutral', label: 'Neutral' },
            { value: 'difficult', label: 'Difficult' },
            { value: 'very_difficult', label: 'Very Difficult' },
          ]},
          { key: 'comments', label: 'Comments', dataType: 'text' },
        ],
      },
    ],
  },

  // Forms → Form → Fields (relationship-based)
  {
    key: 'forms',
    icon: <ListChecks size={20} weight="duotone" className="text-primary" />,
    title: 'Forms',
    description: 'Form submissions and lead capture',
    fields: [],
    subSources: [
      {
        key: 'contact-us',
        label: 'Contact Us',
        sourceType: 'transactional',
        fields: [
          { key: 'submitted_date', label: 'Submitted Date', dataType: 'date' },
          { key: 'subject', label: 'Subject', dataType: 'text' },
          { key: 'message', label: 'Message', dataType: 'text' },
        ],
      },
      {
        key: 'newsletter-signup',
        label: 'Newsletter Signup',
        sourceType: 'transactional',
        fields: [
          { key: 'signup_date', label: 'Signup Date', dataType: 'date' },
          { key: 'source_page', label: 'Source Page', dataType: 'text' },
        ],
      },
      {
        key: 'quote-request',
        label: 'Quote Request',
        sourceType: 'transactional',
        fields: [
          { key: 'request_date', label: 'Request Date', dataType: 'date' },
          { key: 'service_type', label: 'Service Type', dataType: 'enum', enumOptions: [
            { value: 'consultation', label: 'Consultation' },
            { value: 'full_service', label: 'Full Service' },
            { value: 'maintenance', label: 'Maintenance' },
          ]},
          { key: 'budget', label: 'Budget', dataType: 'number' },
        ],
      },
    ],
  },

  // Push Notifications → Campaign → Fields (relationship-based)
  {
    key: 'push',
    icon: <Bell size={20} weight="duotone" className="text-primary" />,
    title: 'Push',
    description: 'Push notification engagement',
    fields: [],
    subSources: [
      {
        key: 'app-updates',
        label: 'App Updates',
        sourceType: 'transactional',
        fields: [
          { key: 'sent_date', label: 'Sent Date', dataType: 'date' },
          { key: 'was_delivered', label: 'Was Delivered', dataType: 'boolean' },
          { key: 'was_opened', label: 'Was Opened', dataType: 'boolean' },
        ],
      },
      {
        key: 'promotions',
        label: 'Promotions',
        sourceType: 'transactional',
        fields: [
          { key: 'sent_date', label: 'Sent Date', dataType: 'date' },
          { key: 'was_delivered', label: 'Was Delivered', dataType: 'boolean' },
          { key: 'was_opened', label: 'Was Opened', dataType: 'boolean' },
          { key: 'converted', label: 'Converted', dataType: 'boolean' },
        ],
      },
    ],
  },

  // Saved Filters → Boolean include/exclude (composition)
  {
    key: 'saved_filters',
    icon: <FunnelIcon size={20} weight="duotone" className="text-primary" />,
    title: 'Saved Filters',
    description: 'Combine with previously saved filter templates',
    fields: [
      { key: 'gold-members', label: 'Gold Members', dataType: 'boolean' },
      { key: 'active-last-90-days', label: 'Active Last 90 Days', dataType: 'boolean' },
      { key: 'high-value-customers', label: 'High Value Customers', dataType: 'boolean' },
      { key: 'churned-contacts', label: 'Churned Contacts', dataType: 'boolean' },
      { key: 'newsletter-subscribers', label: 'Newsletter Subscribers', dataType: 'boolean' },
    ],
  },
]

const EMPTY_GROUP: FilterGroup = { logic: 'and', conditions: [] }

const MAX_CONDITIONS = 25
const MAX_GROUPS = 10

export default function CardFilterBuilderDemo(props: Record<string, unknown>) {
  const allowNesting = (props['allow-nesting'] as boolean) ?? true
  const maxDepth = (props['max-depth'] as number) ?? 3

  const [value, setValue] = useState<FilterGroup>(EMPTY_GROUP)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false)

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
    walk(value)
    return { totalConditions: conditions, totalGroups: groups }
  }, [value])

  const conditionsNearLimit = totalConditions >= MAX_CONDITIONS * 0.8
  const groupsNearLimit = totalGroups >= MAX_GROUPS * 0.8

  // Mock match count — decreases as conditions are added
  const matchCount = totalConditions === 0 ? 12847 : Math.max(0, 12847 - totalConditions * 2341)

  // Clear all handler (with confirmation)
  function handleClearAllConfirm() {
    setValue(EMPTY_GROUP)
    setClearAllDialogOpen(false)
  }

  // Save template handler
  function handleSaveTemplate() {
    toast.success('Template saved')
    setTemplateDialogOpen(false)
    setTemplateName('')
  }

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

  return (
    <div className="flex flex-col w-full h-[600px] min-h-0 rounded-lg border border-border overflow-hidden">
      {/* Top bar — white bg, border bottom */}
      <div className="shrink-0 flex items-center justify-end gap-3 px-4 py-2 bg-background border-b border-border">
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

      {/* Filter Builder — scrollable, surface background, vertically centres empty state */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-gutter-stable px-4 bg-surface flex flex-col">
        <ModalFilterBuilder
          value={value}
          onChange={setValue}
          sourceCategories={DEFAULT_SOURCE_CATEGORIES}
          allowNesting={allowNesting}
          maxDepth={maxDepth}
          maxConditions={25}
          maxGroups={10}
        />
      </div>

      {/* Footer — white bg, border top */}
      <div className="shrink-0 border-t border-border px-4 py-3 bg-background">
        <div className="flex items-center gap-6">
          {/* Condition count */}
          <span className="text-sm text-muted-foreground">
            Conditions <span className={cn("font-semibold", conditionCountColour)}>{totalConditions}/{MAX_CONDITIONS}</span>
          </span>

          {/* Group count */}
          <span className="text-sm text-muted-foreground">
            Groups <span className={cn("font-semibold", groupCountColour)}>{totalGroups}/{MAX_GROUPS}</span>
          </span>

          {/* Estimated records — right-aligned with trend icon */}
          <span className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <TrendDown size={18} weight="regular" />
            <span className="font-semibold text-foreground">{matchCount.toLocaleString()}</span>
            estimated records
          </span>
        </div>
      </div>

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
