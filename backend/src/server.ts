import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PufferVaultService } from './contracts/pufferVault.service';
import { InfluxDBService } from './services/influxdb.service';
import { RateTrackerService } from './background/rateTracker.service';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize services
const pufferVaultService = new PufferVaultService();
const influxDBService = new InfluxDBService();
const rateTrackerService = new RateTrackerService(pufferVaultService, influxDBService);

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    rateTracking: rateTrackerService.isTracking()
  });
});

// Start server
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  
  // Start rate tracking
  try {
    await rateTrackerService.startTracking();
    console.log('Rate tracking started');
  } catch (error: any) {
    console.error('Failed to start rate tracking:', error?.message || 'Unknown error');
  }
}); 