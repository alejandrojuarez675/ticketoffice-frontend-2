'use client';

import { Box, TextField, Button, MenuItem, Chip, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

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
  const day = ref.getDay(); // 0 dom .. 6 sáb
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

  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'dateAsc');
  const [free, setFree] = useState(searchParams.get('free') === 'true');
  const [savedOnly, setSavedOnly] = useState(searchParams.get('savedOnly') === 'true');

  useEffect(() => {
    setCountry(searchParams.get('country') || '');
    setCity(searchParams.get('city') || '');
    setCategory(searchParams.get('category') || '');
    setDateFrom(searchParams.get('dateFrom') || '');
    setDateTo(searchParams.get('dateTo') || '');
    setSort(searchParams.get('sort') || 'dateAsc');
    setFree(searchParams.get('free') === 'true');
    setSavedOnly(searchParams.get('savedOnly') === 'true');
  }, [searchParams]);

  const pushParams = (updater: (sp: URLSearchParams) => void) => {
    const sp = new URLSearchParams(searchParams.toString());
    updater(sp);
    router.push(`/events?${sp.toString()}`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    pushParams((sp) => {
      country ? sp.set('country', country) : sp.delete('country');
      city ? sp.set('city', city) : sp.delete('city');
      category ? sp.set('category', category) : sp.delete('category');
      dateFrom ? sp.set('dateFrom', dateFrom) : sp.delete('dateFrom');
      dateTo ? sp.set('dateTo', dateTo) : sp.delete('dateTo');
      sort ? sp.set('sort', sort) : sp.delete('sort');
      free ? sp.set('free', 'true') : sp.delete('free');
      savedOnly ? sp.set('savedOnly', 'true') : sp.delete('savedOnly');
      sp.set('page', '1');
      if (!sp.get('pageSize')) sp.set('pageSize', '12');
    });
  };

  const clear = () => {
    router.push('/events?page=1&pageSize=12&sort=dateAsc');
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

  const toggleFree = () => {
    pushParams((sp) => {
      const current = sp.get('free') === 'true';
      if (current) sp.delete('free');
      else sp.set('free', 'true');
      sp.set('page', '1');
    });
  };

  const toggleSaved = () => {
    pushParams((sp) => {
      const current = sp.get('savedOnly') === 'true';
      if (current) sp.delete('savedOnly');
      else sp.set('savedOnly', 'true');
      sp.set('page', '1');
    });
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Chip label="Hoy" onClick={setToday} />
        <Chip label="Este fin de semana" onClick={setWeekend} />
        <Chip
          label="Gratis"
          color={free ? 'primary' : 'default'}
          variant={free ? 'filled' : 'outlined'}
          onClick={toggleFree}
        />
        <Chip
          label="Guardados"
          color={savedOnly ? 'primary' : 'default'}
          variant={savedOnly ? 'filled' : 'outlined'}
          onClick={toggleSaved}
        />
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField fullWidth label="País" value={country} onChange={(e) => setCountry(e.target.value)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField fullWidth label="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField fullWidth label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            fullWidth
            type="date"
            label="Desde"
            slotProps={{ inputLabel: { shrink: true } }}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            fullWidth
            type="date"
            label="Hasta"
            slotProps={{ inputLabel: { shrink: true } }}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
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
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'stretch', sm: 'flex-end' }, mt: { xs: 1, md: 0 } }}>
            <Button type="submit" variant="contained">Buscar</Button>
            <Button type="button" variant="outlined" onClick={clear}>Limpiar</Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}