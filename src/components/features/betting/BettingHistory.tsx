import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FilterList as FilterListIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { riskManagement } from '@/services/riskManagement';

const HistoryCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

interface Bet {
  id: string;
  recommendationId: string;
  amount: number;
  type: 'straight' | 'parlay' | 'teaser';
  odds: number;
  timestamp: number;
  status: 'pending' | 'won' | 'lost';
  payout?: number;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Bet;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  { id: 'timestamp', label: 'Date', numeric: false },
  { id: 'type', label: 'Type', numeric: false },
  { id: 'recommendationId', label: 'Recommendation', numeric: false },
  { id: 'odds', label: 'Odds', numeric: true },
  { id: 'amount', label: 'Amount', numeric: true },
  { id: 'payout', label: 'Payout', numeric: true },
  { id: 'status', label: 'Status', numeric: false },
];

const filterOptions = {
  type: ['Single', 'Parlay', 'Teaser', 'Prop'],
  status: ['pending', 'won', 'lost'] as const,
};

export const BettingHistory: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof Bet>('timestamp');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
  });

  useEffect(() => {
    const loadBets = async () => {
      setLoading(true);
      try {
        const userBets = riskManagement.getBets();
        setBets(userBets);
      } catch (error) {
        console.error('Error loading bets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBets();
  }, []);

  const handleRequestSort = (property: keyof Bet) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStatusColor = (status: Bet['status']) => {
    switch (status) {
      case 'won':
        return 'success';
      case 'lost':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const filteredBets = bets.filter(bet => {
    return (
      (filters.type === '' || bet.type === filters.type) &&
      (filters.status === '' || bet.status === filters.status)
    );
  });

  const sortedBets = filteredBets.sort((a, b) => {
    const isAsc = order === 'asc';
    if (orderBy === 'timestamp') {
      return isAsc
        ? a.timestamp - b.timestamp
        : b.timestamp - a.timestamp;
    }
    if (orderBy === 'odds' || orderBy === 'amount' || orderBy === 'payout') {
      return isAsc
        ? (a[orderBy] || 0) - (b[orderBy] || 0)
        : (b[orderBy] || 0) - (a[orderBy] || 0);
    }
    return isAsc
      ? String(a[orderBy]).localeCompare(String(b[orderBy]))
      : String(b[orderBy]).localeCompare(String(a[orderBy]));
  });

  const paginatedBets = sortedBets.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const winRate = filteredBets.length > 0
    ? (filteredBets.filter(bet => bet.status === 'won').length / filteredBets.length) * 100
    : 0;

  const totalAmount = filteredBets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalPayout = filteredBets.reduce((sum, bet) => sum + (bet.payout || 0), 0);

  return (
    <Box sx={{ width: '100%' }}>
      <HistoryCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Betting History
          </Typography>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Bet Type"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.type.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.status.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Summary Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Bets
                </Typography>
                <Typography variant="h6">
                  {filteredBets.length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Win Rate
                </Typography>
                <Typography variant="h6">
                  {winRate.toFixed(1)}%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Amount
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(totalAmount)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Payout
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(totalPayout)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Betting History Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.numeric ? 'right' : 'left'}
                      sortDirection={orderBy === headCell.id ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={headCells.length} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : paginatedBets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headCells.length} align="center">
                      No bets found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBets.map((bet) => (
                    <TableRow key={bet.id}>
                      <TableCell>{formatDate(bet.timestamp)}</TableCell>
                      <TableCell>{bet.type}</TableCell>
                      <TableCell>{bet.recommendationId}</TableCell>
                      <TableCell align="right">{bet.odds}</TableCell>
                      <TableCell align="right">{formatCurrency(bet.amount)}</TableCell>
                      <TableCell align="right">
                        {bet.payout ? formatCurrency(bet.payout) : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                          color={getStatusColor(bet.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredBets.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </HistoryCard>
    </Box>
  );
}; 