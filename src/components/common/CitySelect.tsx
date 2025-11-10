'use client';

import * as React from 'react';
import { Autocomplete, TextField } from '@mui/material';

// Catálogo simple para MVP. Agrega/quita ciudades según tus eventos reales.
const CITY_MAP: Record<string, string[]> = {
  Colombia: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga'],
  Argentina: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata'],
};

// Cuando País = "Todos", combinamos listas de CO + AR
function citiesFor(countryLabel: string): string[] {
  if (!countryLabel || countryLabel.toLowerCase() === 'todos') {
    const co = CITY_MAP['Colombia'] ?? [];
    const ar = CITY_MAP['Argentina'] ?? [];
    return Array.from(new Set([...co, ...ar])).sort();
  }
  return (CITY_MAP[countryLabel] ?? []).slice().sort();
}

type Props = {
  countryLabel: string;     // 'Todos' | 'Colombia' | 'Argentina'
  value: string;            // ciudad o 'Todas'
  onChange: (val: string) => void;
  label?: string;
  disabled?: boolean;
};

export default function CitySelect({
  countryLabel,
  value,
  onChange,
  label = 'Ciudad',
  disabled,
}: Props) {
  const options = React.useMemo(() => ['Todas', ...citiesFor(countryLabel)], [countryLabel]);
  const normalized = value || 'Todas';

  return (
    <Autocomplete
      options={options}
      value={normalized}
      onChange={(_, val) => onChange(val || 'Todas')}
      disableClearable
      isOptionEqualToValue={(opt, val) => opt === val}
      renderInput={(params) => (
        <TextField {...params} label={label} size="small" />
      )}
      sx={{ minWidth: 220 }}
      disabled={disabled}
    />
  );
}
