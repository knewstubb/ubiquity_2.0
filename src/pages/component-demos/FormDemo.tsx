import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FormDemoProps {
  'section-count'?: number
  'field-count'?: number
  'input-types'?: string
  'show-descriptions'?: boolean
  'show-section-headers'?: boolean
  'max-width'?: number
  validation?: string
}

type FieldType = 'text' | 'select' | 'checkbox' | 'textarea' | 'email'

interface FieldDef {
  name: string
  label: string
  placeholder: string
  type: FieldType
  options?: { label: string; value: string }[]
}

const SECTION_NAMES = ['Personal Details', 'Preferences', 'Additional Info']

const TEXT_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Full Name', placeholder: 'Sarah Chen', type: 'text' },
  { name: 'email', label: 'Email', placeholder: 'sarah@example.com', type: 'email' },
  { name: 'phone', label: 'Phone', placeholder: '+64 21 123 4567', type: 'text' },
  { name: 'company', label: 'Company', placeholder: 'Acme Corp', type: 'text' },
]

const MIXED_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Full Name', placeholder: 'Sarah Chen', type: 'text' },
  { name: 'role', label: 'Role', placeholder: '', type: 'select', options: [
    { label: 'Admin', value: 'admin' },
    { label: 'Editor', value: 'editor' },
    { label: 'Viewer', value: 'viewer' },
  ]},
  { name: 'newsletter', label: 'Subscribe to newsletter', placeholder: '', type: 'checkbox' },
  { name: 'email', label: 'Email', placeholder: 'sarah@example.com', type: 'email' },
]

const ALL_TYPE_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Full Name', placeholder: 'Sarah Chen', type: 'text' },
  { name: 'tier', label: 'Membership Tier', placeholder: '', type: 'select', options: [
    { label: 'Bronze', value: 'bronze' },
    { label: 'Silver', value: 'silver' },
    { label: 'Gold', value: 'gold' },
    { label: 'Platinum', value: 'platinum' },
  ]},
  { name: 'bio', label: 'Bio', placeholder: 'Tell us about yourself...', type: 'textarea' },
  { name: 'terms', label: 'I agree to the terms of service', placeholder: '', type: 'checkbox' },
]

function getFieldsForType(inputTypes: string): FieldDef[] {
  switch (inputTypes) {
    case 'mixed': return MIXED_FIELDS
    case 'all-types': return ALL_TYPE_FIELDS
    default: return TEXT_FIELDS
  }
}

export default function FormDemo(props: FormDemoProps) {
  const sectionCount = props['section-count']
  const hasControls = sectionCount !== undefined

  if (hasControls) {
    return (
      <ControlledForm
        sectionCount={sectionCount}
        fieldCount={props['field-count'] ?? 2}
        inputTypes={props['input-types'] ?? 'text-only'}
        showSectionHeaders={props['show-section-headers'] ?? true}
        maxWidth={props['max-width'] ?? 100}
        validation={props.validation ?? 'none'}
      />
    )
  }

  return <ShowcaseForm />
}

function ControlledForm({
  sectionCount,
  fieldCount,
  inputTypes,
  showSectionHeaders,
  maxWidth,
  validation,
}: {
  sectionCount: number
  fieldCount: number
  inputTypes: string
  showSectionHeaders: boolean
  maxWidth: number
  validation: string
}) {
  const availableFields = getFieldsForType(inputTypes)
  const isError = validation === 'error'

  return (
    <div className="w-full" style={{ maxWidth: `${maxWidth}%` }}>
      <form className="flex flex-col gap-6">
        {Array.from({ length: sectionCount }).map((_, sectionIdx) => {
          const sectionFields = Array.from({ length: fieldCount }, (_, fieldIdx) => {
            const globalIdx = sectionIdx * fieldCount + fieldIdx
            return availableFields[globalIdx % availableFields.length]
          })

          return (
            <div key={sectionIdx}>
              {showSectionHeaders && (
                <h3 className="text-base font-semibold tracking-wide text-foreground mb-2">
                  {SECTION_NAMES[sectionIdx % SECTION_NAMES.length]}
                </h3>
              )}
              <div className="space-y-3">
                {sectionFields.map((fieldDef, fieldIdx) => (
                  <RenderField
                    key={`${sectionIdx}-${fieldIdx}`}
                    fieldDef={fieldDef}
                    isError={isError}
                  />
                ))}
              </div>
            </div>
          )
        })}
        <Button type="button">Submit</Button>
      </form>
    </div>
  )
}

function RenderField({ fieldDef, isError }: { fieldDef: FieldDef; isError: boolean }) {
  if (fieldDef.type === 'checkbox') {
    return (
      <div className="flex items-center space-x-2">
        <Checkbox id={fieldDef.name} />
        <Label htmlFor={fieldDef.name}>{fieldDef.label}</Label>
      </div>
    )
  }

  if (fieldDef.type === 'select') {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldDef.name}>{fieldDef.label}</Label>
        <Select>
          <SelectTrigger id={fieldDef.name} aria-invalid={isError ? true : undefined}>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {fieldDef.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (fieldDef.type === 'textarea') {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldDef.name}>{fieldDef.label}</Label>
        <Textarea
          id={fieldDef.name}
          placeholder={fieldDef.placeholder}
          aria-invalid={isError ? true : undefined}
        />
      </div>
    )
  }

  // Default: text or email — uses the Input component directly
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldDef.name}>{fieldDef.label}</Label>
      <Input
        id={fieldDef.name}
        type={fieldDef.type === 'email' ? 'email' : 'text'}
        placeholder={fieldDef.placeholder}
        aria-invalid={isError ? true : undefined}
      />
      {isError && (
        <p className="text-xs text-destructive">Validation message</p>
      )}
    </div>
  )
}

function ShowcaseForm() {
  return (
    <div className="max-w-sm">
      <form className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="showcase-name">Name</Label>
          <Input id="showcase-name" placeholder="Sarah Chen" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="showcase-email">Email</Label>
          <Input id="showcase-email" type="email" placeholder="sarah@example.com" />
        </div>
        <Button type="button">Submit</Button>
      </form>
    </div>
  )
}
