import { useState } from 'react';
import type { TransactionalSource } from '../../models/connector';
import styles from './KeyFieldPicker.module.css';

interface KeyFieldPickerProps {
  transactionalSource: TransactionalSource;
  value: string | null;
  onChange: (key: string) => void;
}

export function KeyFieldPicker({ value, onChange }: KeyFieldPickerProps) {
  const [contactField, setContactField] = useState('id');
  return (
    <div className={styles.container}>
      <div className={styles.fieldRow}>
        <select
          className={styles.select}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Key field"
        >
          <option value="" disabled>Select key field…</option>
          <option value="customerId">Customer Reference (customerId)</option>
          <option value="email">Email Address (email)</option>
          <option value="phone">Phone Number (phone)</option>
          <option value="membershipTier">Membership Tier</option>
        </select>
        <span className={styles.arrow}>→</span>
        <select
          className={styles.select}
          value={contactField}
          onChange={(e) => setContactField(e.target.value)}
          aria-label="Contact matching field"
        >
          <option value="id">Contact ID (id)</option>
          <option value="email">Email Address (email)</option>
          <option value="phone">Phone Number (phone)</option>
          <option value="firstName">First Name</option>
          <option value="lastName">Last Name</option>
          <option value="membershipTier">Membership Tier</option>
        </select>
      </div>
    </div>
  );
}
