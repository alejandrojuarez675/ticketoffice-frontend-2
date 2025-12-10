/**
 * [F3-004] exportExcel - Utilidades para exportar datos a Excel/CSV
 * 
 * GUÍA: Este módulo proporciona funciones para exportar datos a formatos
 * descargables (CSV, que Excel puede abrir directamente).
 * 
 * Uso:
 * ```tsx
 * import { exportToCSV, exportSalesToExcel } from '@/utils/exportExcel';
 * 
 * // Exportar datos genéricos
 * exportToCSV(data, columns, 'reporte.csv');
 * 
 * // Exportar ventas de evento
 * exportSalesToExcel(sales, eventName);
 * ```
 * 
 * NOTA: Para MVP usamos CSV que Excel puede abrir directamente.
 * Para formato .xlsx nativo se requeriría librería externa (xlsx, exceljs).
 */

/**
 * Definición de columna para exportación
 */
export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  formatter?: (value: unknown, row: T) => string;
}

/**
 * Escapa un valor para formato CSV
 */
function escapeCSV(value: unknown): string {
  if (value == null) return '';
  
  const str = String(value);
  
  // Si contiene comillas, comas o saltos de línea, envolver en comillas
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Obtiene un valor anidado de un objeto usando dot notation
 * Ejemplo: getNestedValue(obj, 'buyer.email') -> obj.buyer.email
 */
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
  }, obj as unknown);
}

/**
 * Convierte datos a formato CSV
 */
export function toCSV<T extends object>(
  data: T[],
  columns: ExportColumn<T>[]
): string {
  // Encabezados
  const headers = columns.map(col => escapeCSV(col.header)).join(',');
  
  // Filas
  const rows = data.map(row => {
    return columns.map(col => {
      const value = typeof col.key === 'string' && col.key.includes('.')
        ? getNestedValue(row, col.key)
        : row[col.key as keyof T];
      
      if (col.formatter) {
        return escapeCSV(col.formatter(value, row));
      }
      
      return escapeCSV(value);
    }).join(',');
  });
  
  // BOM para UTF-8 (para que Excel reconozca caracteres especiales)
  const BOM = '\uFEFF';
  
  return BOM + [headers, ...rows].join('\r\n');
}

/**
 * Descarga un archivo
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/csv;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Exporta datos a CSV y descarga el archivo
 */
export function exportToCSV<T extends object>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  const csv = toCSV(data, columns);
  downloadFile(csv, filename);
}

// ============================================================================
// EXPORTACIONES ESPECÍFICAS PARA EL MVP
// ============================================================================

/**
 * [F3-004] Tipo de venta para exportación (simplificado)
 */
export interface SaleExportRow {
  id: string;
  buyerName?: string;
  buyerEmail?: string;
  ticketType?: string;
  quantity?: number;
  total?: number;
  status?: string;
  createdAt?: string;
  validatedAt?: string;
}

/**
 * [F3-004] Columnas por defecto para exportar ventas
 */
export const SALES_EXPORT_COLUMNS: ExportColumn<SaleExportRow>[] = [
  { key: 'id', header: 'ID Venta' },
  { key: 'buyerName', header: 'Nombre Comprador' },
  { key: 'buyerEmail', header: 'Email' },
  { key: 'ticketType', header: 'Tipo de Entrada' },
  { 
    key: 'quantity', 
    header: 'Cantidad',
    formatter: (v) => v != null ? String(v) : '1'
  },
  { 
    key: 'total', 
    header: 'Total',
    formatter: (v) => v != null ? `$${Number(v).toLocaleString()}` : '-'
  },
  { 
    key: 'status', 
    header: 'Estado',
    formatter: (v) => {
      const statusMap: Record<string, string> = {
        'validated': 'Validado',
        'pending': 'Pendiente',
        'cancelled': 'Cancelado',
      };
      return statusMap[String(v)] || String(v || '-');
    }
  },
  { 
    key: 'createdAt', 
    header: 'Fecha Compra',
    formatter: (v) => v ? new Date(String(v)).toLocaleString('es') : '-'
  },
  { 
    key: 'validatedAt', 
    header: 'Fecha Validación',
    formatter: (v) => v ? new Date(String(v)).toLocaleString('es') : '-'
  },
];

/**
 * [F3-004] Exportar ventas de un evento a Excel (CSV)
 * 
 * GUÍA: Usa esta función desde la página de ventas de evento:
 * ```tsx
 * import { exportSalesToExcel } from '@/utils/exportExcel';
 * 
 * const handleExport = () => {
 *   exportSalesToExcel(sales, 'Concierto Rock', 'todas');
 * };
 * 
 * <Button onClick={handleExport}>Exportar Excel</Button>
 * ```
 */
export function exportSalesToExcel(
  sales: SaleExportRow[],
  eventName: string,
  filterLabel = 'todas'
): void {
  // Sanitizar nombre del evento para el archivo
  const sanitizedName = eventName
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `ventas_${sanitizedName}_${filterLabel}_${timestamp}.csv`;
  
  exportToCSV(sales, SALES_EXPORT_COLUMNS, filename);
}

/**
 * [F3-004] Exportar lista de asistentes (solo validados)
 */
export function exportAttendeesList(
  sales: SaleExportRow[],
  eventName: string
): void {
  const validatedSales = sales.filter(s => s.status === 'validated');
  
  const attendeeColumns: ExportColumn<SaleExportRow>[] = [
    { key: 'buyerName', header: 'Nombre' },
    { key: 'buyerEmail', header: 'Email' },
    { key: 'ticketType', header: 'Tipo de Entrada' },
    { 
      key: 'validatedAt', 
      header: 'Hora de Entrada',
      formatter: (v) => v ? new Date(String(v)).toLocaleTimeString('es') : '-'
    },
  ];
  
  const sanitizedName = eventName
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `asistentes_${sanitizedName}_${timestamp}.csv`;
  
  exportToCSV(validatedSales, attendeeColumns, filename);
}

export default {
  toCSV,
  downloadFile,
  exportToCSV,
  exportSalesToExcel,
  exportAttendeesList,
};

