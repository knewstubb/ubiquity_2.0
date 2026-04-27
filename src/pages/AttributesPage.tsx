import { PageShell } from '../components/layout/PageShell';
import { DataTable, type Column } from '../components/shared/DataTable';
import {
  CONTACT_FIELDS,
  TREATMENT_FIELDS,
  PRODUCT_FIELDS,
  type FieldDefinition,
} from '../data/fieldRegistry';
import styles from './AttributesPage.module.css';

const DATA_TYPE_LABEL: Record<string, string> = {
  string: 'Text',
  number: 'Number',
  date: 'Date',
  enum: 'Enum',
};

const SOURCE_LABEL: Record<string, string> = {
  contact: 'Contact',
  treatment: 'Treatment',
  product: 'Product',
};

const allFields: FieldDefinition[] = [
  ...CONTACT_FIELDS,
  ...TREATMENT_FIELDS,
  ...PRODUCT_FIELDS,
];

const columns: Column<FieldDefinition>[] = [
  { key: 'label', header: 'Field Name', render: (f) => f.label },
  {
    key: 'dataType',
    header: 'Data Type',
    width: '140px',
    render: (f) => (
      <span className={styles.dataType}>{DATA_TYPE_LABEL[f.dataType] ?? 'Text'}</span>
    ),
  },
  {
    key: 'source',
    header: 'Source',
    width: '140px',
    render: (f) => SOURCE_LABEL[f.source] ?? f.source,
  },
];

export default function AttributesPage() {
  return (
    <PageShell title="Attributes" subtitle="Field definitions and custom attributes">
      <DataTable columns={columns} data={allFields} emptyMessage="No attributes defined" />
    </PageShell>
  );
}
