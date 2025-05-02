import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface ActivityData {
  timestamp: string;
  rate: number;
  change: number;
}

interface RecentActivityTableProps {
  data?: ActivityData[];
  isLoading?: boolean;
}

export const RecentActivityTable = ({ data, isLoading = false }: RecentActivityTableProps) => {
  if (isLoading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3} align="center">
                <Typography>Loading...</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!data?.length) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3} align="center">
                <Typography>No data available</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Timestamp</TableCell>
            <TableCell align="right">Rate</TableCell>
            <TableCell align="right">Change</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.timestamp}</TableCell>
              <TableCell align="right">{row.rate.toFixed(6)}</TableCell>
              <TableCell align="right">
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                  color={row.change >= 0 ? 'success.main' : 'error.main'}
                >
                  {row.change >= 0 ? <TrendingUp /> : <TrendingDown />}
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {Math.abs(row.change).toFixed(2)}%
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 