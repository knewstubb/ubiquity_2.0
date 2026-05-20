import { useState } from 'react';
import type { TransactionalSource } from '../../models/automation';

interface KeyFieldPickerProps {
  transactionalSource: TransactionalSource;
  value: string | null;
  onChange: (key: string) => void;
}

export function KeyFieldPicker({ value, onChange }: KeyFieldPickerProps) {
  const [contactField, setContactField] = useState('id');
  return (
    <div>
      <div className="flex items-center gap-3">
        <select
          className="flex-1 py-2 px-3 border border-border rounded-md text-sm text-foreground bg-background outline-none focus:border-primary focus:shadow-ring"
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
        <span className="text-sm text-tertiary-foreground">→</span>
        <select
          className="flex-1 py-2 px-3 border border-border rounded-md text-sm text-foreground bg-background outline-none focus:border-primary focus:shadow-ring"
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
