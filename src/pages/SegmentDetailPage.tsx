import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { FilterBuilder } from '../components/shared/FilterBuilder';
import { DataTable, type Column } from '../components/shared/DataTable';
import { useAccount } from '../contexts/AccountContext';
import { segments } from '../data/segments';
import { spaContacts } from '../data/spaContacts';
import { evaluateFilterGroup } from '../utils/filterEngine';
import { cn } from '../lib/utils';
import type { FilterGroup } from '../models/segment';
import type { Contact } from '../models/contact';

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
  const [rootGroup, setRootGroup] = useState<FilterGroup>(
    segment?.rootGroup ?? { combinator: 'AND', rules: [], groups: [] },
  );

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
  const matchedContacts = evaluateFilterGroup(rootGroup, accountContacts);
  const previewContacts = matchedContacts.slice(0, 10);

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

      <FilterBuilder
        value={rootGroup}
        onChange={isManual ? () => {} : setRootGroup}
        readOnly={isManual}
      />

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
