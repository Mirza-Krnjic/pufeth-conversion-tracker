import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert,
  Link
} from '@mui/material';
import { TrendingUp, TrendingDown, Info } from '@mui/icons-material';
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
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            pufETH Conversion Rate
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            pufETH is Puffer's liquid staking token. The conversion rate represents how much ETH you receive when redeeming 1 pufETH.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Rate = totalAssets() / totalSupply()
          </Typography>
          <Link 
            href="https://etherscan.io/address/0xD9A442856C234a39a81a089C06451EBAa4306a72" 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Info fontSize="small" />
            View PufferVaultV2 Contract
          </Link>
        </Box>
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