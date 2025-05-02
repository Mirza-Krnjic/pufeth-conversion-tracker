import { Grid, Paper, Typography, Box } from '@mui/material';
import { Layout, ConversionRateCard, HistoricalDataChart, RecentActivityTable } from '../components';

export const HomePage = () => {
  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          pufETH Conversion Rate Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and monitor the pufETH conversion rate in real-time
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Current Conversion Rate Card */}
        <Grid item xs={12} md={6}>
          <ConversionRateCard />
        </Grid>

        {/* Historical Data Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Historical Conversion Rate
            </Typography>
            <HistoricalDataChart />
          </Paper>
        </Grid>

        {/* Recent Activity Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <RecentActivityTable />
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}; 