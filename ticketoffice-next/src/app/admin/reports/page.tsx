'use client';

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  Button, 
  Paper, 
  Tabs, 
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  ListItemText,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  Download as DownloadIcon, 
  FilterList as FilterListIcon,
  DateRange as DateRangeIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `report-tab-${index}`,
    'aria-controls': `report-tabpanel-${index}`,
  };
}

const ReportsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const [reportType, setReportType] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateChange = (field: 'startDate' | 'endDate') => (date: Date | null) => {
    setDateRange(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setReportType(event.target.value);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGenerateReport = (type: string) => {
    console.log(`Generating ${type} report`, { dateRange, reportType });
    handleClose();
  };

  // Mock data for the reports
  const reportData = Array.from({ length: 25 }, (_, i) => ({
    id: `RPT-${1000 + i}`,
    name: `Reporte de ventas ${i + 1}`,
    type: ['Ventas', 'Usuarios', 'Eventos', 'Pagos'][Math.floor(Math.random() * 4)],
    date: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    status: ['Completado', 'En progreso', 'Fallido'][Math.floor(Math.random() * 3)],
    size: `${Math.floor(Math.random() * 5) + 1} MB`
  }));

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ mr: 'auto' }}>
          Reportes
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha inicio"
              value={dateRange.startDate}
              onChange={handleDateChange('startDate')}
              slotProps={{
                textField: {
                  size: 'small',
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRangeIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
            <DatePicker
              label="Fecha fin"
              value={dateRange.endDate}
              onChange={handleDateChange('endDate')}
              slotProps={{
                textField: {
                  size: 'small',
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRangeIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
          </LocalizationProvider>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="report-type-label">Tipo de reporte</InputLabel>
            <Select
              labelId="report-type-label"
              id="report-type-select"
              value={reportType}
              label="Tipo de reporte"
              onChange={handleReportTypeChange}
            >
              <MenuItem value="all">Todos los reportes</MenuItem>
              <MenuItem value="sales">Ventas</MenuItem>
              <MenuItem value="users">Usuarios</MenuItem>
              <MenuItem value="events">Eventos</MenuItem>
              <MenuItem value="payments">Pagos</MenuItem>
            </Select>
          </FormControl>

          <Button 
            variant="contained" 
            color="primary"
            startIcon={<FilterListIcon />}
            onClick={() => console.log('Aplicar filtros')}
          >
            Filtrar
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={() => {
              setDateRange({ startDate: null, endDate: null });
              setReportType('all');
            }}
          >
            Limpiar
          </Button>
        </Box>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="report tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Todos" {...a11yProps(0)} />
            <Tab label="Ventas" {...a11yProps(1)} />
            <Tab label="Usuarios" {...a11yProps(2)} />
            <Tab label="Eventos" {...a11yProps(3)} />
            <Tab label="Pagos" {...a11yProps(4)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <TextField
              size="small"
              placeholder="Buscar reportes..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <div>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleClick}
              >
                Generar reporte
              </Button>
              <Menu
                id="generate-report-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={() => handleGenerateReport('sales')}>
                  <ListItemText primary="Reporte de ventas" secondary="Detalle de todas las ventas" />
                </MenuItem>
                <MenuItem onClick={() => handleGenerateReport('users')}>
                  <ListItemText primary="Reporte de usuarios" secondary="Usuarios registrados" />
                </MenuItem>
                <MenuItem onClick={() => handleGenerateReport('events')}>
                  <ListItemText primary="Reporte de eventos" secondary="Eventos y asistencia" />
                </MenuItem>
                <MenuItem onClick={() => handleGenerateReport('payments')}>
                  <ListItemText primary="Reporte de pagos" secondary="Transacciones y pagos" />
                </MenuItem>
              </Menu>
            </div>
          </Box>
          
          <TableContainer component={Paper} sx={{ maxHeight: '60vh' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Tamaño</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.date.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Box 
                          component="span" 
                          sx={{
                            p: '4px 8px',
                            borderRadius: 1,
                            bgcolor: row.status === 'Completado' ? 'success.light' : 
                                     row.status === 'En progreso' ? 'warning.light' : 'error.light',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                          }}
                        >
                          {row.status}
                        </Box>
                      </TableCell>
                      <TableCell>{row.size}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={handleClick}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={reportData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Reportes de Ventas
            </Typography>
            <Typography variant="body1">
              Selecciona un rango de fechas y genera reportes detallados de ventas.
            </Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Reportes de Usuarios
            </Typography>
            <Typography variant="body1">
              Genera informes sobre los usuarios registrados en la plataforma.
            </Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Reportes de Eventos
            </Typography>
            <Typography variant="body1">
              Obtén estadísticas detalladas sobre los eventos y su asistencia.
            </Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Reportes de Pagos
            </Typography>
            <Typography variant="body1">
              Revisa el historial de transacciones y pagos procesados.
            </Typography>
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default ReportsPage;
