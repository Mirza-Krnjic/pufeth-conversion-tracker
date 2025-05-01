import { config } from 'dotenv';
// Load environment variables
config();
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { PufferVaultService } from './contracts/pufferVault.service';
import { InfluxDBService } from './services/influxdb.service';
import { RateTrackerService } from './background/rateTracker.service';
import { createRateRoutes } from './routes/rate.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { swaggerSpec } from './config/swagger';
import logger from './config/logger';


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const pufferVaultService = new PufferVaultService();
const influxDBService = new InfluxDBService();
const rateTrackerService = new RateTrackerService(pufferVaultService, influxDBService);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
  logger.info(`Server running on port ${port}`);
  
  // Start rate tracker
  try {
    await rateTrackerService.startTracking();
    logger.info('Rate tracking started');
  } catch (error: any) {
    logger.error('Failed to start rate tracking', { error: error?.message });
  }
}); 