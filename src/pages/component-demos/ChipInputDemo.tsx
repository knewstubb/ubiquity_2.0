import { useState } from 'react';
import { ChipInput } from '@/components/composed/chip-input';
import { useControlValues } from '@/lib/useControlValues';

const DROPDOWN_OPTIONS = ['Email', 'Customer ID', 'Phone', 'First Name', 'Last Name', 'Company'];

export default function ChipInputDemo({ controls }: { controls?: Record<string, unknown> }) {
  const values = useControlValues(controls);
  const placeholder = (values['placeholder'] as string) ?? 'Add email…';
  const type = (values['type'] as string) ?? 'email';
  const size = (values['size'] as 'sm' | 'default' | 'lg') ?? 'default';
  const useDropdown = (values['dropdown'] as boolean) ?? false;
  const showValidation = (values['validation'] as boolean) ?? true;
  const showCopy = (values['copy-from-above'] as boolean) ?? false;

  const [primaryChips, setPrimaryChips] = useState<string[]>(['brad.knewstubb@spark.co.nz']);
  const [secondaryChips, setSecondaryChips] = useState<string[]>([]);

  // Custom email validation
  function validateEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (showCopy) {
    return (
      <div className="w-full max-w-lg flex flex-col gap-6">
        <ChipInput
          values={primaryChips}
          onChange={setPrimaryChips}
          label="Email Address"
          placeholder={placeholder}
          type={type}
          size={size}
          validate={showValidation ? validateEmail : undefined}
          options={useDropdown ? DROPDOWN_OPTIONS : undefined}
          aria-label="Primary email addresses"
        />
        <ChipInput
          values={secondaryChips}
          onChange={setSecondaryChips}
          label="Email Address"
          copyLabel="copy from above"
          onCopy={() => setSecondaryChips([...primaryChips])}
          placeholder={placeholder}
          type={type}
          size={size}
          validate={showValidation ? validateEmail : undefined}
          options={useDropdown ? DROPDOWN_OPTIONS : undefined}
          aria-label="Secondary email addresses"
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <ChipInput
        values={primaryChips}
        onChange={setPrimaryChips}
        placeholder={placeholder}
        type={type}
        size={size}
        validate={showValidation ? validateEmail : undefined}
        options={useDropdown ? DROPDOWN_OPTIONS : undefined}
        aria-label="Demo chip input"
      />
    </div>
  );
}
