import type { ExportDataType, TransactionalSource } from '../models/connector';

export interface FieldDefinition {
  key: string;
  label: string;
  source: 'contact' | 'treatment' | 'product';
  dataType: 'string' | 'number' | 'date' | 'enum';
  enumValues?: string[];
}

export const CONTACT_FIELDS: FieldDefinition[] = [
  { key: 'firstName', label: 'First Name', source: 'contact', dataType: 'string' },
  { key: 'lastName', label: 'Last Name', source: 'contact', dataType: 'string' },
  { key: 'email', label: 'Email Address', source: 'contact', dataType: 'string' },
  { key: 'phone', label: 'Phone Number', source: 'contact', dataType: 'string' },
  { key: 'membershipTier', label: 'Membership Tier', source: 'contact', dataType: 'enum', enumValues: ['Bronze', 'Silver', 'Gold', 'Platinum'] },
  { key: 'joinDate', label: 'Join Date', source: 'contact', dataType: 'date' },
  { key: 'communicationPreferences', label: 'Communication Preferences', source: 'contact', dataType: 'string' },
];

export const TREATMENT_FIELDS: FieldDefinition[] = [
  { key: 'customerId', label: 'Customer Reference', source: 'treatment', dataType: 'string' },
  { key: 'treatmentType', label: 'Treatment Type', source: 'treatment', dataType: 'string' },
  { key: 'therapistName', label: 'Therapist Name', source: 'treatment', dataType: 'string' },
  { key: 'treatmentDate', label: 'Treatment Date', source: 'treatment', dataType: 'date' },
  { key: 'durationMinutes', label: 'Duration (min)', source: 'treatment', dataType: 'number' },
  { key: 'price', label: 'Price', source: 'treatment', dataType: 'number' },
];

export const PRODUCT_FIELDS: FieldDefinition[] = [
  { key: 'customerId', label: 'Customer Reference', source: 'product', dataType: 'string' },
  { key: 'productName', label: 'Product Name', source: 'product', dataType: 'string' },
  { key: 'category', label: 'Category', source: 'product', dataType: 'enum', enumValues: ['Skincare', 'Massage', 'Aromatherapy', 'Hair', 'Nails', 'Wellness'] },
  { key: 'purchaseChannel', label: 'Purchase Channel', source: 'product', dataType: 'enum', enumValues: ['In-store', 'Online', 'Phone'] },
  { key: 'purchaseDate', label: 'Purchase Date', source: 'product', dataType: 'date' },
  { key: 'price', label: 'Price', source: 'product', dataType: 'number' },
];

const ALL_FIELDS: FieldDefinition[] = [
  ...CONTACT_FIELDS,
  ...TREATMENT_FIELDS,
  ...PRODUCT_FIELDS,
];

export function getFieldByKey(key: string): FieldDefinition | undefined {
  return ALL_FIELDS.find((f) => f.key === key);
}

export function getFieldsForDataType(
  dataType: ExportDataType,
  transactionalSource?: TransactionalSource
): FieldDefinition[] {
  switch (dataType) {
    case 'contact':
      return CONTACT_FIELDS;
    case 'transactional':
      return transactionalSource === 'treatments'
        ? TREATMENT_FIELDS
        : PRODUCT_FIELDS;
    case 'transactional_with_contact': {
      const txFields = transactionalSource === 'treatments'
        ? TREATMENT_FIELDS
        : PRODUCT_FIELDS;
      return [...txFields, ...CONTACT_FIELDS];
    }
  }
}
