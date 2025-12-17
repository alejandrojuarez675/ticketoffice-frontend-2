// src/components/events/FiltersPanel.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  FormControlLabel,
  Switch,
  TextField,
  MenuItem,
  Stack,
  Paper,
  IconButton,
  Typography,
  Tooltip,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter, useSearchParams } from 'next/navigation';
import { todayRange, weekendRange } from '@/utils/date';

type Facets = {
  countries: string[];
  cities: string[];
  categories: string[];
  citiesByCountry: Record<string, string[]>;
};

export default function FiltersPanel({
  facets,
  activeCount = 0,
}: {
  facets: Facets;
  activeCount?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);

  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [savedOnly, setSavedOnly] = useState(searchParams.get('savedOnly') === 'true');
  const [adultOnly, setAdultOnly] = useState(searchParams.get('adultOnly') === 'true');

  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '');

  useEffect(() => {
    if (open) return;
    setCountry(searchParams.get('country') || '');
    setCity(searchParams.get('city') || '');
    setCategory(searchParams.get('category') || '');
    setDateFrom(searchParams.get('dateFrom') || '');
    setDateTo(searchParams.get('dateTo') || '');
    setSavedOnly(searchParams.get('savedOnly') === 'true');
    setAdultOnly(searchParams.get('adultOnly') === 'true');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams, open]);

  const filteredCities = useMemo(() => {
    if (!country || country === 'all' || country === '') return facets.cities;
    return facets.citiesByCountry[country] ?? [];
  }, [country, facets]);

  useEffect(() => {
    if (!city) return;
    for (const [c, list] of Object.entries(facets.citiesByCountry)) {
      if (list.includes(city)) {
        setCountry(c);
        break;
      }
    }
  }, [city, facets.citiesByCountry]);

  const pushParams = (updater: (sp: URLSearchParams) => void) => {
    const sp = new URLSearchParams(searchParams.toString());
    updater(sp);
    router.push(`/events?${sp.toString()}`);
  };

  const apply = () => {
    pushParams((sp) => {
      // País: si está vacío, usamos "all" (Todos) para alinear con la vista
      if (country) sp.set('country', country);
      else sp.set('country', 'all');

      if (city) sp.set('city', city);
      else sp.delete('city');
      if (category) sp.set('category', category);
      else sp.delete('category');
      if (dateFrom) sp.set('dateFrom', dateFrom);
      else sp.delete('dateFrom');
      if (dateTo) sp.set('dateTo', dateTo);
      else sp.delete('dateTo');
      if (savedOnly) sp.set('savedOnly', 'true');
      else sp.delete('savedOnly');
      if (adultOnly) sp.set('adultOnly', 'true');
      else sp.delete('adultOnly');

      const minP = minPrice.trim() === '' ? undefined : Number(minPrice);
      const maxP = maxPrice.trim() === '' ? undefined : Number(maxPrice);
      if (minP !== undefined && !Number.isNaN(minP)) sp.set('minPrice', String(minP));
      else sp.delete('minPrice');
      if (maxP !== undefined && !Number.isNaN(maxP)) sp.set('maxPrice', String(maxP));
      else sp.delete('maxPrice');

      if (!sp.get('pageSize')) sp.set('pageSize', '9');
      sp.set('page', '1');
    });
    setOpen(false);
  };

  const clear = () => {
    router.push('/events?country=all&page=1&pageSize=9&sort=dateAsc');
  };

  const closeWithoutApply = () => {
    setCountry(searchParams.get('country') || '');
    setCity(searchParams.get('city') || '');
    setCategory(searchParams.get('category') || '');
    setDateFrom(searchParams.get('dateFrom') || '');
    setDateTo(searchParams.get('dateTo') || '');
    setSavedOnly(searchParams.get('savedOnly') === 'true');
    setAdultOnly(searchParams.get('adultOnly') === 'true');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setOpen(false);
  };

  const setToday = (checked: boolean) => {
    if (checked) {
      const t = todayRange();
      setDateFrom(t.from);
      setDateTo(t.to);
    } else {
      setDateFrom('');
      setDateTo('');
    }
  };

  const setWeekend = (checked: boolean) => {
    if (checked) {
      const w = weekendRange();
      setDateFrom(w.from);
      setDateTo(w.to);
    } else {
      setDateFrom('');
      setDateTo('');
    }
  };

  const hasActive = activeCount > 0;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button variant="contained" startIcon={<FilterAltIcon />} onClick={() => setOpen((v) => !v)}>
          Filtros
        </Button>
        {hasActive && <Chip label={`${activeCount}`} color="primary" variant="filled" />}
        {hasActive && (
          <Button variant="outlined" onClick={clear}>
            Eliminar filtros
          </Button>
        )}
      </Box>

      <Collapse in={open} unmountOnExit>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Filtrar eventos
            </Typography>
            <Tooltip title="Cerrar sin aplicar">
              <IconButton aria-label="Cerrar" onClick={closeWithoutApply}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Stack spacing={2}>
            {/* Toggles rápidos - En mobile solo los más importantes */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControlLabel
                  control={<Switch checked={!!dateFrom && !!dateTo && dateFrom === dateTo} onChange={(_, c) => setToday(c)} />}
                  label="Hoy"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={(() => {
                        const w = weekendRange();
                        return dateFrom === w.from && dateTo === w.to;
                      })()}
                      onChange={(_, c) => setWeekend(c)}
                    />
                  }
                  label="Este fin de semana"
                />
              </Grid>
              {!isMobile && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControlLabel control={<Switch checked={adultOnly} onChange={(_, c) => setAdultOnly(c)} />} label="Mayores de edad" />
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControlLabel control={<Switch checked={savedOnly} onChange={(_, c) => setSavedOnly(c)} />} label="Guardados" />
              </Grid>
            </Grid>

            {/* Fechas + precios - En mobile solo fechas */}
            {!isMobile && (
              <Grid container spacing={2}>
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

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Precio mínimo"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    slotProps={{ input: { inputProps: { min: 0 } }, inputLabel: { shrink: true } }}
                    sx={{
                      '& input::-webkit-outer-spin-button,& input::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                      '& input[type=number]': { MozAppearance: 'textfield' },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Precio máximo"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    slotProps={{ input: { inputProps: { min: 0 } }, inputLabel: { shrink: true } }}
                    sx={{
                      '& input::-webkit-outer-spin-button,& input::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                      '& input[type=number]': { MozAppearance: 'textfield' },
                    }}
                  />
                </Grid>
              </Grid>
            )}

            {/* País -> Ciudad dependiente / Categoría */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="País"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setCity('');
                  }}
                  disabled={!!city}
                  helperText={city ? 'País bloqueado por selección de ciudad' : ' '}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="Colombia">Colombia</MenuItem>
                  <MenuItem value="Argentina">Argentina</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Ciudad"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  helperText={country && country !== 'all' ? `Ciudades en ${country}` : 'Todas las ciudades'}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {filteredCities.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {!isMobile && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField select fullWidth label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <MenuItem value="">Todas</MenuItem>
                    {facets.categories.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={clear}>Limpiar</Button>
              <Button variant="contained" onClick={apply}>
                Aplicar
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Collapse>
    </>
  );
}
