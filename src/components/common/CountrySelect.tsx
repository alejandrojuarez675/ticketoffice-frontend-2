// src/components/common/CountrySelect.tsx
'use client';

import * as React from 'react';
import { Autocomplete, TextField } from '@mui/material';

const COUNTRY_OPTIONS = ['Todos', 'Colombia', 'Argentina'] as const;

type Props = {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export default function CountrySelect({
  value,
  onChange,
  label = 'País',
  required = true,
  disabled,
  placeholder,
}: Props) {
  const normalized = value || 'Todos';

  return (
    <Autocomplete
      options={COUNTRY_OPTIONS as unknown as string[]}
      value={normalized}
      onChange={(_, val) => onChange(val || 'Todos')}
      disableClearable={required}
      renderInput={(params) => (
        <TextField {...params} label={label} required={required} placeholder={placeholder} size="small" />
      )}
      isOptionEqualToValue={(opt, val) => opt === val}
      disabled={disabled}
      sx={{ minWidth: 220 }}
    />
  );
}