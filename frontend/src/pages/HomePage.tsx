import { Grid, Paper, Typography, Box, Link } from '@mui/material';
import { Layout } from '../components/Layout';
import { ConversionRateCard } from '../components/ConversionRateCard';
import { HistoricalDataChart } from '../components/HistoricalDataChart';
import { RecentActivityTable } from '../components/RecentActivityTable';

export const HomePage = () => {
  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          pufETH Conversion Rate Tracker
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            About pufETH
          </Typography>
          <Typography variant="body1" paragraph>
            pufETH is one of Puffer's main products. It represents a liquid staking token that tracks the conversion rate between pufETH and ETH.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Conversion Rate Calculation
          </Typography>
          <Typography variant="body1" paragraph>
            The conversion rate is calculated as: <code>totalAssets() / totalSupply()</code>
          </Typography>
          <Typography variant="body1" paragraph>
            Contract Address: <code>0xD9A442856C234a39a81a089C06451EBAa4306a72</code>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Learn more about pufETH at{' '}
            <Link href="https://docs.puffer.fi" target="_blank" rel="noopener noreferrer">
              docs.puffer.fi
            </Link>
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {/* Current Conversion Rate Card */}
          <Grid item xs={12} md={6}>
            <ConversionRateCard />
          </Grid>

          {/* Historical Data Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Conversion Rate History
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Track how the pufETH conversion rate changes over time
              </Typography>
              <HistoricalDataChart />
            </Paper>
          </Grid>

          {/* Recent Activity Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Rate Changes
              </Typography>
              <RecentActivityTable />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}; 