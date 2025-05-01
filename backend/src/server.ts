import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { PufferVaultService } from './contracts/pufferVault.service';
import { InfluxDBService } from './services/influxdb.service';
import { RateTrackerService } from './background/rateTracker.service';
import { createRateRoutes } from './routes/rate.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const pufferVaultService = new PufferVaultService();
const influxDBService = new InfluxDBService();
const rateTrackerService = new RateTrackerService(pufferVaultService, influxDBService);

// Routes
app.use('/rates', createRateRoutes(pufferVaultService, influxDBService));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    rateTracker: rateTrackerService.isTracking() ? 'running' : 'stopped'
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  
  // Start rate tracker
  try {
    await rateTrackerService.startTracking();
    console.log('Rate tracking started');
  } catch (error: any) {
    console.error('Failed to start rate tracking:', error?.message || 'Unknown error');
  }
}); 