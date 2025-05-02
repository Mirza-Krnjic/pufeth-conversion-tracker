import { Box, CircularProgress, Select, MenuItem, FormControl, InputLabel, Alert, Typography } from '@mui/material';
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
import { useHistoricalData } from '../hooks/useConversionRate';
import { useState } from 'react';

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

const timeRanges = [
  { value: '1h', label: 'Last Hour' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

const calculatePercentageChange = (current: number, previous: number) => {
  return ((current - previous) / previous) * 100;
};

export const HistoricalDataChart = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const { data, isLoading, error } = useHistoricalData(timeRange);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load historical data. Please try again later.
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  const rates = data?.map(point => point.rate) || [];
  const timestamps = data?.map(point => new Date(point.timestamp)) || [];
  const percentageChanges = rates.map((rate, index) => {
    if (index === 0) return 0;
    return calculatePercentageChange(rate, rates[index - 1]);
  });

  const chartData = {
    labels: timestamps,
    datasets: [
      {
        label: 'pufETH Conversion Rate',
        data: rates,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.15)',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.2,
        yAxisID: 'y',
      },
      {
        label: 'ETH Reference (1.0)',
        data: rates.map(() => 1.0),
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
        tension: 0,
        yAxisID: 'y',
      },
      {
        label: 'Percentage Change',
        data: percentageChanges,
        borderColor: 'rgba(153, 102, 255, 0.3)',
        backgroundColor: 'rgba(153, 102, 255, 0.05)',
        borderWidth: 2,
        tension: 0.1,
        yAxisID: 'y1',
        hidden: true,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const datasetIndex = context.datasetIndex;
            const dataIndex = context.dataIndex;
            const value = context.parsed.y;

            if (datasetIndex === 0) {
              const change = percentageChanges[dataIndex];
              const changeText = change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
              return [
                `pufETH Rate: ${value.toFixed(6)}`,
                `Change from previous: ${changeText}`,
                `Change from ETH: ${((value - 1) * 100).toFixed(2)}%`,
              ];
            } else if (datasetIndex === 1) {
              return 'ETH Reference (1.0)';
            } else {
              return `Change: ${value.toFixed(2)}%`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: (timeRange === '1h' ? 'minute' : timeRange === '24h' ? 'hour' : 'day') as 'minute' | 'hour' | 'day',
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm',
            day: 'MMM d',
          },
        },
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Conversion Rate (pufETH/ETH)',
        },
        min: Math.min(...rates) ? Math.min(...rates) * 0.995 : undefined,
        max: Math.max(...rates) ? Math.max(...rates) * 1.005 : undefined,
        ticks: {
          stepSize: undefined,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: false,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Percentage Change',
        },
      },
    },
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            {timeRanges.map((range) => (
              <MenuItem key={range.value} value={range.value}>
                {range.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Line data={chartData} options={options} />
      {data && data.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Current Rate: {data[data.length - 1].rate.toFixed(6)} (
            {percentageChanges[percentageChanges.length - 1] >= 0 ? '+' : ''}
            {percentageChanges[percentageChanges.length - 1].toFixed(2)}%)
          </Typography>
        </Box>
      )}
    </Box>
  );
}; 