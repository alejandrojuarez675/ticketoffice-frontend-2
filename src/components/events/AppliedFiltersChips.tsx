'use client';

import { Box, Chip } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AppliedFiltersChips() {
  const router = useRouter();
  const sp = useSearchParams();

  const items: { key: string; label: string }[] = [];

  const country = sp.get('country');
  const city = sp.get('city');
  const category = sp.get('category');
  const dateFrom = sp.get('dateFrom');
  const dateTo = sp.get('dateTo');
  const minPrice = sp.get('minPrice');
  const maxPrice = sp.get('maxPrice');
  const savedOnly = sp.get('savedOnly') === 'true';
  const adultOnly = sp.get('adultOnly') === 'true';
  const vendorsParam = sp.get('vendors');

  if (country) items.push({ key: 'country', label: `País: ${country}` });
  if (city) items.push({ key: 'city', label: `Ciudad: ${city}` });
  if (category) items.push({ key: 'category', label: `Categoría: ${category}` });
  if (dateFrom || dateTo) items.push({ key: 'date', label: `Fecha: ${dateFrom ?? ''}${dateTo ? ` → ${dateTo}` : ''}` });
  if (minPrice || maxPrice) items.push({ key: 'price', label: `Precio: ${minPrice ?? '0'} - ${maxPrice ?? '∞'}` });
  if (savedOnly) items.push({ key: 'savedOnly', label: 'Guardados' });
  if (adultOnly) items.push({ key: 'adultOnly', label: '+18' });
  if (vendorsParam) {
    const count = vendorsParam.split(',').filter(Boolean).length;
    items.push({ key: 'vendors', label: `Vendedores: ${count}` });
  }

  const remove = (k: string) => {
    const next = new URLSearchParams(sp.toString());
    switch (k) {
      case 'country':
        next.delete('country');
        break;
      case 'city':
        next.delete('city');
        break;
      case 'category':
        next.delete('category');
        break;
      case 'date':
        next.delete('dateFrom');
        next.delete('dateTo');
        break;
      case 'price':
        next.delete('minPrice');
        next.delete('maxPrice');
        break;
      case 'savedOnly':
        next.delete('savedOnly');
        break;
      case 'adultOnly':
        next.delete('adultOnly');
        break;
      case 'vendors':
        next.delete('vendors');
        break;
    }
    next.set('page', '1');
    router.push(`/events?${next.toString()}`);
  };

  if (items.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
      {items.map((it) => (
        <Chip key={it.key} label={it.label} onDelete={() => remove(it.key)} />
      ))}
    </Box>
  );
}