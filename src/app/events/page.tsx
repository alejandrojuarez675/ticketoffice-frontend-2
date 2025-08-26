'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';

import LightLayout from '@/components/layouts/LightLayout';
import EventCard from '@/components/events/EventCard';
import FiltersPanel from '@/components/events/FiltersPanel';
import AppliedFiltersChips from '@/components/events/AppliedFiltersChips';
import { EventService } from '@/services/EventService';
import type { SearchEvent, SearchEventParams } from '@/types/search-event';
import { Box, Container, Typography, Pagination } from '@mui/material';
import Grid from '@mui/material/Grid';

import { useSearchParams, useRouter } from 'next/navigation';
import { getFavoriteIds } from '@/utils/favorites';
import { applyFilters, buildFacets, sortEvents, paginate, type Filters, type SortKey } from '@/utils/eventsFilters';
import Loading from '@/components/common/Loading';
import ErrorState from '@/components/common/ErrorState';
import Empty from '@/components/common/Empty';

function EventsListInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allEvents, setAllEvents] = useState<SearchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sort: SortKey = (searchParams.get('sort') as SortKey) || 'dateAsc';
  const page = Number(searchParams.get('page') || 1);
  const pageSize = Number(searchParams.get('pageSize') || 6);
  const savedOnly = searchParams.get('savedOnly') === 'true';
  const adultOnly = searchParams.get('adultOnly') === 'true';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const vendorsParam = searchParams.get('vendors');

  const filters: Filters = useMemo(
    () => ({
      country: searchParams.get('country') || undefined,
      city: searchParams.get('city') || undefined,
      category: searchParams.get('category') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      savedOnly,
      adultOnly,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      vendors: vendorsParam ? vendorsParam.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
    }),
    [searchParams, savedOnly, adultOnly, minPrice, maxPrice, vendorsParam]
  );

  // Carga de catálogo completo y única (mock). Con BE real, migrar a server-side paging con endpoints de conteo.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await EventService.searchEvents({ pageNumber: 1, pageSize: 999 } as SearchEventParams);
        if (!active) return;
        setAllEvents(res.events);
      } catch (err) {
        if (!active) return;
        setError('Error al cargar eventos');
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Facetas desde todo el catálogo
  const facets = useMemo(() => buildFacets(allEvents), [allEvents]);

  // Aplicar filtros + orden sobre todo el catálogo, luego paginar en cliente para “rellenar” cada página.
  const favoriteIds = getFavoriteIds();
  const { slice: visible, total, totalPages, page: safePage } = useMemo(() => {
    const filtered = applyFilters(allEvents, filters, favoriteIds);
    const sorted = sortEvents(filtered, sort);
    return paginate(sorted, page, pageSize);
  }, [allEvents, filters, sort, page, pageSize, favoriteIds]);

  const handlePageChange = (_: unknown, value: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('page', String(value));
    sp.set('pageSize', String(pageSize));
    router.push(`/events?${sp.toString()}`);
  };

  // Contador de filtros activos y chips
  const activeCount = useMemo(() => {
    let n = 0;
    const keys = ['country', 'city', 'category', 'dateFrom', 'dateTo', 'savedOnly', 'adultOnly', 'minPrice', 'maxPrice', 'vendors'];
    keys.forEach((k) => {
      const v = searchParams.get(k);
      if (v && v !== 'false' && v !== '0') n += 1;
    });
    return n;
  }, [searchParams]);

  return (
    <Container sx={{ py: 4 }}>
      <FiltersPanel facets={facets} activeCount={activeCount} />
      <AppliedFiltersChips />

      {error && (
        <Box sx={{ mb: 3 }}>
          <ErrorState message={error} onRetry={() => { setError(null); /* re-trigger */ setLoading(true); }} />
        </Box>
      )}

      {loading ? (
        <Loading label="Cargando eventos..." minHeight="40vh" />
      ) : visible.length === 0 ? (
        <Empty title="No se encontraron eventos" description="Ajusta los filtros o limpia la búsqueda." />
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {visible.length} {visible.length === 1 ? 'resultado' : 'resultados'} de {total} {total === 1 ? 'total' : 'totales'}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {visible.map((e: SearchEvent) => (
              <Grid key={e.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <EventCard event={e} />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination shape="rounded" color="primary" count={totalPages} page={safePage} onChange={handlePageChange} />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default function EventsPage() {
  return (
    <LightLayout title="Eventos - TicketOffice">
      <Box sx={{ py: 3 }}>
        <Container>
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 2 }}>
            Explora eventos
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Usa Filtros para ajustar ciudad, país, categoría, fechas, precios, guardados y +18.
          </Typography>
        </Container>

        <Suspense fallback={<Container><Loading label="Cargando..." /></Container>}>
          <EventsListInner />
        </Suspense>
      </Box>
    </LightLayout>
  );
}