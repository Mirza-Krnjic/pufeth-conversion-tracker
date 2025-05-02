import { Typography, Box } from '@mui/material';
import { Layout } from '../components/Layout';

export const HomePage = () => {
  return (
    <Layout>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Welcome to PufETH Conversion Tracker
        </Typography>
        <Typography variant="body1">
          Track and monitor your PufETH conversions in real-time.
        </Typography>
      </Box>
    </Layout>
  );
}; 