import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface ActivityData {
  timestamp: string;
  rate: number;
  change: number;
}

interface RecentActivityTableProps {
  data?: ActivityData[];
  isLoading?: boolean;
  limit?: number;
}

export const RecentActivityTable = ({ data, isLoading = false, limit = 10 }: RecentActivityTableProps) => {
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

  const sortedData = [...data]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell align="right">Rate</TableCell>
            <TableCell align="right">Change</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{formatDistanceToNow(new Date(row.timestamp), { addSuffix: true })}</TableCell>
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