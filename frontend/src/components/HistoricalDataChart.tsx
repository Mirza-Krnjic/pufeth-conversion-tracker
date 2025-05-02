import { Box, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface HistoricalDataChartProps {
  data?: {
    timestamp: string;
    rate: number;
  }[];
  isLoading?: boolean;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

export const HistoricalDataChart = ({ 
  data, 
  isLoading = false, 
  timeRange = '1h',
  onTimeRangeChange 
}: HistoricalDataChartProps) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  const chartData = {
    datasets: [
      {
        label: 'Conversion Rate',
        data: data?.map(point => ({
          x: new Date(point.timestamp),
          y: point.rate
        })) || [],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Rate: ${context.parsed.y.toFixed(6)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'minute' as const,
        },
      },
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => onTimeRangeChange?.(e.target.value)}
          >
            <MenuItem value="1h">Last Hour</MenuItem>
            <MenuItem value="6h">Last 6 Hours</MenuItem>
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ height: 400 }}>
        <Line data={chartData} options={options} />
      </Box>
    </Box>
  );
}; 