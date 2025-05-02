import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface ConversionRateCardProps {
  rate?: number;
  isLoading?: boolean;
  change?: number;
}

export const ConversionRateCard = ({ rate, isLoading = false, change }: ConversionRateCardProps) => {
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
              {rate?.toFixed(6) || 'N/A'}
            </Typography>
            {change !== undefined && (
              <Box display="flex" alignItems="center" color={change >= 0 ? 'success.main' : 'error.main'}>
                {change >= 0 ? <TrendingUp /> : <TrendingDown />}
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {Math.abs(change).toFixed(2)}%
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}; 