import { useState } from 'react';
import { PrefixInput } from '@/components/composed/prefix-input';
import { useControlValues } from '@/lib/useControlValues';

export default function PrefixInputDemo({ controls }: { controls?: Record<string, unknown> }) {
  const values = useControlValues(controls);
  const prefix = (values['prefix'] as string) ?? '/company/base-path/';
  const placeholder = (values['placeholder'] as string) ?? 'e.g. daily-export';
  const disabled = (values['disabled'] as boolean) ?? false;

  const [value, setValue] = useState('my-folder');

  return (
    <div className="w-full max-w-md">
      <PrefixInput
        prefix={prefix}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
