import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UsersThree, Package, Sparkle } from '@phosphor-icons/react';
import { PageShell } from '../components/layout/PageShell';
import { ModalFilterBuilder } from '../components/composed/filter-builder';
import type { FilterGroup as ModalFilterGroup, SourceCategoryConfig, CardFilterRow } from '../components/composed/filter-builder';
import { DataTable, type Column } from '../components/shared/DataTable';
import { useAccount } from '../contexts/AccountContext';
import { segments } from '../data/segments';
import { spaContacts } from '../data/spaContacts';
import { evaluateFilterGroup } from '../utils/filterEngine';
import { cn } from '../lib/utils';
import type { FilterGroup as SegmentFilterGroup } from '../models/segment';
import type { Contact } from '../models/contact';
import { CONTACT_FIELDS, TREATMENT_FIELDS, PRODUCT_FIELDS } from '../data/fieldRegistry';

/** Map field registry dataType to ModalFilterBuilder dataType */
function mapDataType(dataType: string): 'text' | 'number' | 'date' | 'boolean' | 'enum' {
  if (dataType === 'string') return 'text';
  return dataType as 'text' | 'number' | 'date' | 'boolean' | 'enum';
}

/** Source categories for the ModalFilterBuilder drill-down UI */
const SOURCE_CATEGORIES: SourceCategoryConfig[] = [
  {
    id: 'contacts',
    label: 'Contacts',
    icon: UsersThree,
    subSources: [
      {
        id: 'contact-fields',
        label: 'Contact Fields',
        sourceType: 'field',
        fields: CONTACT_FIELDS.map((f) => ({
          key: f.key,
          label: f.label,
          dataType: mapDataType(f.dataType),
          enumValues: f.enumValues,
        })),
      },
    ],
  },
  {
    id: 'transactional',
    label: 'Transactional',
    icon: Package,
    subSources: [
      {
        id: 'treatments',
        label: 'Treatments',
        sourceType: 'transactional',
        fields: TREATMENT_FIELDS.map((f) => ({
          key: f.key,
          label: f.label,
          dataType: mapDataType(f.dataType),
          enumValues: f.enumValues,
        })),
      },
      {
        id: 'products',
        label: 'Products',
        sourceType: 'transactional',
        fields: PRODUCT_FIELDS.map((f) => ({
          key: f.key,
          label: f.label,
          dataType: mapDataType(f.dataType),
          enumValues: f.enumValues,
        })),
      },
    ],
  },
];

/** Convert segment FilterGroup to ModalFilterBuilder FilterGroup */
function segmentToModalFilterGroup(segmentGroup: SegmentFilterGroup): ModalFilterGroup {
  const conditions: ModalFilterGroup['conditions'] = [];
  
  // Convert rules to row conditions
  for (const rule of segmentGroup.rules) {
    if (rule.field && rule.operator) {
      conditions.push({
        type: 'row',
        row: {
          sourceCategory: 'contacts',
          subSourcePath: ['contact-fields'],
          field: rule.field,
          operator: rule.operator,
          value: rule.value as string | number | boolean | null | [string, string] | string[],
          dateMode: null,
          subFilters: null,
          aggregate: null,
        },
      });
    }
  }
  
  // Convert nested groups
  for (const nestedGroup of segmentGroup.groups) {
    conditions.push({
      type: 'group',
      group: segmentToModalFilterGroup(nestedGroup),
    });
  }
  
  return {
    logic: segmentGroup.combinator.toLowerCase() as 'and' | 'or',
    conditions,
  };
}

/** Convert ModalFilterBuilder FilterGroup to segment FilterGroup */
function modalToSegmentFilterGroup(modalGroup: ModalFilterGroup): SegmentFilterGroup {
  const rules: SegmentFilterGroup['rules'] = [];
  const groups: SegmentFilterGroup['groups'] = [];
  
  for (const condition of modalGroup.conditions) {
    if (condition.type === 'row') {
      rules.push({
        field: condition.row.field ?? '',
        operator: condition.row.operator ?? '',
        value: condition.row.value as string | string[] | number,
      });
    } else if (condition.type === 'group') {
      groups.push(modalToSegmentFilterGroup(condition.group));
    }
  }
  
  return {
    combinator: modalGroup.logic.toUpperCase() as 'AND' | 'OR',
    rules,
    groups,
  };
}

const memberColumns: Column<Contact>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (c) => `${c.firstName} ${c.lastName}`,
  },
  {
    key: 'email',
    header: 'Email',
    render: (c) => c.email,
  },
  {
    key: 'membershipTier',
    header: 'Membership Tier',
    width: '140px',
    render: (c) => c.membershipTier,
  },
  {
    key: 'joinDate',
    header: 'Join Date',
    width: '120px',
    render: (c) => new Date(c.joinDate).toLocaleDateString(),
  },
];

export default function SegmentDetailPage() {
  const { segmentId } = useParams<{ segmentId: string }>();
  const navigate = useNavigate();
  const { filterByAccount } = useAccount();

  const segment = segments.find((s) => s.id === segmentId);
  
  // Store filter in modal format internally, convert to/from segment format for persistence
  const [modalFilterGroup, setModalFilterGroup] = useState<ModalFilterGroup>(() =>
    segmentToModalFilterGroup(segment?.rootGroup ?? { combinator: 'AND', rules: [], groups: [] })
  );
  
  // Convert back to segment format for evaluation
  const segmentFilterGroup = modalToSegmentFilterGroup(modalFilterGroup);

  if (!segment) {
    return (
      <PageShell title="Segment Not Found">
        <p className="text-center py-10 text-tertiary-foreground text-base">The segment you're looking for doesn't exist.</p>
        <button
          className="inline-flex items-center gap-1 text-sm text-primary no-underline cursor-pointer bg-none border-none p-0 font-[inherit] hover:underline"
          onClick={() => navigate('/audiences/segments')}
        >
          ← Back to Segments
        </button>
      </PageShell>
    );
  }

  const isManual = segment.type === 'manual';
  const accountContacts: Contact[] = filterByAccount(spaContacts);
  const matchedContacts = evaluateFilterGroup(segmentFilterGroup, accountContacts);
  const previewContacts = matchedContacts.slice(0, 10);
  
  function handleFilterChange(newGroup: ModalFilterGroup) {
    if (!isManual) {
      setModalFilterGroup(newGroup);
    }
  }

  return (
    <PageShell title="Segment Detail">
      <button
        className="inline-flex items-center gap-1 text-sm text-primary no-underline mb-4 cursor-pointer bg-none border-none p-0 font-[inherit] hover:underline"
        onClick={() => navigate('/audiences/segments')}
      >
        ← Back to Segments
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold text-foreground m-0">{segment.name}</h2>
        <span className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium leading-tight whitespace-nowrap",
          segment.type === 'smart' && "bg-accent text-accent-foreground",
          segment.type === 'manual' && "bg-secondary text-muted-foreground"
        )}>
          {segment.type === 'smart' ? 'Smart' : 'Manual'}
        </span>
        <span className="text-sm text-tertiary-foreground">{matchedContacts.length} members</span>
      </div>

      {isManual && (
        <p className="text-sm text-tertiary-foreground italic mb-3">
          This is a manual segment. Membership is managed manually, not by filter rules.
        </p>
      )}

      {!isManual && (
        <div className="border border-border rounded-lg bg-white">
          <ModalFilterBuilder
            value={modalFilterGroup}
            onChange={handleFilterChange}
            sourceCategories={SOURCE_CATEGORIES}
            allowNesting={true}
            maxDepth={3}
          />
        </div>
      )}

      {/* Match count indicator */}
      <div className="flex items-center gap-2 px-3 py-2 mt-4 text-sm text-muted-foreground bg-background border border-border rounded-md">
        <strong className="text-primary font-semibold">{matchedContacts.length}</strong>
        {matchedContacts.length === 1 ? ' contact matches' : ' contacts match'}
        {modalFilterGroup.conditions.length === 0 && ' (all contacts)'}
      </div>

      <div className="mt-6">
        <h3 className="text-base font-semibold text-muted-foreground m-0 mb-3">Members Preview</h3>
        <DataTable
          columns={memberColumns}
          data={previewContacts}
          emptyMessage="No matching contacts"
        />
      </div>
    </PageShell>
  );
}
