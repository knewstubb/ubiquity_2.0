import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { FilterBuilder } from '../components/shared/FilterBuilder';
import { DataTable, type Column } from '../components/shared/DataTable';
import { useAccount } from '../contexts/AccountContext';
import { segments } from '../data/segments';
import { spaContacts } from '../data/spaContacts';
import { evaluateFilterGroup } from '../utils/filterEngine';
import type { FilterGroup } from '../models/segment';
import type { Contact } from '../models/contact';
import styles from './SegmentDetailPage.module.css';

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
        <p className={styles.notFound}>The segment you're looking for doesn't exist.</p>
        <button className={styles.backLink} onClick={() => navigate('/audiences/segments')}>
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
      <button className={styles.backLink} onClick={() => navigate('/audiences/segments')}>
        ← Back to Segments
      </button>

      <div className={styles.segmentHeader}>
        <h2 className={styles.segmentName}>{segment.name}</h2>
        <span className={`${styles.typeBadge} ${styles[segment.type]}`}>
          {segment.type === 'smart' ? 'Smart' : 'Manual'}
        </span>
        <span className={styles.memberCount}>{matchedContacts.length} members</span>
      </div>

      {isManual && (
        <p className={styles.manualLabel}>
          This is a manual segment. Membership is managed manually, not by filter rules.
        </p>
      )}

      <FilterBuilder
        value={rootGroup}
        onChange={isManual ? () => {} : setRootGroup}
        readOnly={isManual}
      />

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Members Preview</h3>
        <DataTable
          columns={memberColumns}
          data={previewContacts}
          emptyMessage="No matching contacts"
        />
      </div>
    </PageShell>
  );
}
