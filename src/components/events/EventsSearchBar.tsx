// src/components/events/EventsSearchBar.tsx
'use client';

import { Box, TextField, Button, MenuItem, Chip, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import CountrySelect from '@/components/common/CountrySelect';

const SORT_OPTIONS = [
  { value: 'dateAsc', label: 'Fecha (más cercano)' },
  { value: 'dateDesc', label: 'Fecha (más lejano)' },
  { value: 'priceAsc', label: 'Precio (menor a mayor)' },
  { value: 'priceDesc', label: 'Precio (mayor a menor)' },
];

function formatDateInput(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWeekendRange(ref = new Date()) {
  const day = ref.getDay();
  const diffToSat = (6 - day + 7) % 7;
  const saturday = new Date(ref);
  saturday.setDate(ref.getDate() + diffToSat);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  return { from: formatDateInput(saturday), to: formatDateInput(sunday) };
}

export default function EventsSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [country, setCountry] = useState(searchParams.get('country') || 'Todos');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'dateAsc');

  useEffect(() => {
    setCountry(
      (() => {
        const v = searchParams.get('country') || '';
        if (!v) return 'Todos';
        if (v.toLowerCase() === 'all') return 'Todos';
        return v;
      })()
    );
    setCity(searchParams.get('city') || '');
    setQ(searchParams.get('q') || '');
    setDateFrom(searchParams.get('dateFrom') || '');
    setDateTo(searchParams.get('dateTo') || '');
    setSort(searchParams.get('sort') || 'dateAsc');
  }, [searchParams]);

  const pushParams = (updater: (sp: URLSearchParams) => void) => {
    const sp = new URLSearchParams(searchParams.toString());
    updater(sp);
    router.push(`/events?${sp.toString()}`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    pushParams((sp) => {
      const countryParam = country === 'Todos' ? 'all' : country;
      sp.set('country', countryParam);
      city ? sp.set('city', city) : sp.delete('city');
      q ? sp.set('q', q) : sp.delete('q');
      dateFrom ? sp.set('dateFrom', dateFrom) : sp.delete('dateFrom');
      dateTo ? sp.set('dateTo', dateTo) : sp.delete('dateTo');
      sort ? sp.set('sort', sort) : sp.delete('sort');
      sp.set('page', '1');
      if (!sp.get('pageSize')) sp.set('pageSize', '9');
    });
  };

  const clear = () => {
    router.push('/events?country=all&page=1&pageSize=9&sort=dateAsc');
  };

  const setToday = () => {
    const today = formatDateInput(new Date());
    pushParams((sp) => {
      sp.set('dateFrom', today);
      sp.set('dateTo', today);
      sp.set('page', '1');
    });
  };

  const setWeekend = () => {
    const { from, to } = getWeekendRange(new Date());
    pushParams((sp) => {
      sp.set('dateFrom', from);
      sp.set('dateTo', to);
      sp.set('page', '1');
    });
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Chip label="Hoy" onClick={setToday} />
        <Chip label="Este fin de semana" onClick={setWeekend} />
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CountrySelect value={country} onChange={setCountry} label="País" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField fullWidth label="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField fullWidth label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField fullWidth select label="Ordenar por" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            type="date"
            label="Desde"
            slotProps={{ inputLabel: { shrink: true } }}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            type="date"
            label="Hasta"
            slotProps={{ inputLabel: { shrink: true } }}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'stretch', sm: 'flex-end' }, mt: { xs: 1, md: 0 } }}>
            <Button type="submit" variant="contained" disabled={!country.trim()}>
              Buscar
            </Button>
            <Button type="button" variant="outlined" onClick={clear}>
              Limpiar
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
