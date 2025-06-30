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
  Paper
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { SalesService } from '../services/SalesService';
import { SalesResponse } from '../types/Sales';

const AdminEventSalesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
              </TableRow>
            </TableHead>
            <TableBody>
              {salesData.sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.firstName}</TableCell>
                  <TableCell>{sale.lastName}</TableCell>
                  <TableCell>{sale.email}</TableCell>
                  <TableCell>{sale.ticketType}</TableCell>
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
