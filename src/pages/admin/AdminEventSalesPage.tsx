import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { SalesService } from '../../services/SalesService';
import { useRef } from 'react';
import { SalesResponse } from '../../types/Sales';

const AdminEventSalesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const selectedSaleId = useRef<string | null>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>, saleId: string) => {
    setAnchorEl(event.currentTarget);
    selectedSaleId.current = saleId;
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleValidate = () => {
    if (selectedSaleId.current && id) {
      navigate(`/admin/events/${id}/sales/${selectedSaleId.current}/validate`);
    }
    handleClose();
  };
  const [salesData, setSalesData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const data = await SalesService.getSalesByEventId(id || '');
        setSalesData(data);
        setError(null);
      } catch (err) {
        setError('Error loading sales data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSales();
    }
  }, [id]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Cargando ventas...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Error: {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!salesData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            No hay datos de ventas disponibles
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Ventas del Evento
        </Typography>
        <Typography variant="h5" gutterBottom>
          Historial de Ventas
        </Typography>
        <Typography variant="body1" gutterBottom>
          Aquí podrás ver el historial de ventas del evento.
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Tipo de Entrada</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Más</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesData.sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.firstName}</TableCell>
                  <TableCell>{sale.lastName}</TableCell>
                  <TableCell>{sale.email}</TableCell>
                  <TableCell>{sale.ticketType}</TableCell>
                  <TableCell>
                    <Typography 
                      color={sale.validated ? 'success.main' : 'error.main'}
                      variant="body2"
                    >
                      {sale.validated ? 'Validada' : 'No validada'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="more"
                      aria-controls="long-menu"
                      aria-haspopup="true"
                      onClick={(event) => handleClick(event, sale.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      id="long-menu"
                      anchorEl={anchorEl}
                      keepMounted
                      open={open}
                      onClose={handleClose}
                    >
                      <MenuItem onClick={handleValidate}>Validar</MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default AdminEventSalesPage;
