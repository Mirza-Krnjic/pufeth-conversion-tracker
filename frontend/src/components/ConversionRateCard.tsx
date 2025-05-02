import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { useCurrentRate } from '../hooks/useConversionRate';

export const ConversionRateCard = () => {
  const { data, isLoading, error } = useCurrentRate();

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load conversion rate. Please try again later.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Current Conversion Rate
        </Typography>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="h3" component="div" sx={{ mb: 1 }}>
              {data?.rate.toFixed(6) || 'N/A'}
            </Typography>
            {data?.change !== undefined && (
              <Box display="flex" alignItems="center" color={data.change >= 0 ? 'success.main' : 'error.main'}>
                {data.change >= 0 ? <TrendingUp /> : <TrendingDown />}
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {Math.abs(data.change).toFixed(2)}%
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}; 