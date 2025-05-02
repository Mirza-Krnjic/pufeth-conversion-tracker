import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { ethers } from 'ethers';
import { writePoint, queryPoints } from './services/database';
import { swaggerSpec } from './swagger';
import dotenv from 'dotenv';
import path from 'path';
import { calculateConversionRate } from './services/conversion';

// Load environment variables with explicit path
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Initialize Express app
export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get current conversion rate
app.get('/api/conversion-rate/current', async (req, res) => {
  try {
    const rate = await calculateConversionRate();
    const timestamp = new Date();
    await writePoint(rate, timestamp);
    res.json({
      rate,
      timestamp: timestamp.toISOString(),
      change: 0 // TODO: Calculate change from previous rate
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch current rate' });
    }
  }
});

// Get historical conversion rates
app.get('/api/conversion-rate/history', async (req, res) => {
  try {
    const start = req.query.start ? new Date(req.query.start as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = req.query.end ? new Date(req.query.end as string) : new Date();
    
    const data = await queryPoints(start, end);
    res.json(data.map(point => ({
      ...point,
      timestamp: point.timestamp.toISOString()
    })));
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch historical data' });
    }
  }
});

// Get recent conversion rate activity
app.get('/api/conversion-rate/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const rate = await calculateConversionRate();
    const timestamp = new Date();
    
    // Generate mock recent activity for now
    const recentActivity = Array.from({ length: limit }, (_, i) => ({
      rate,
      timestamp: new Date(timestamp.getTime() - i * 60000).toISOString(),
      change: 0
    }));
    
    res.json(recentActivity);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
  }
});

// Start server if not imported as a module
export const startServer = (port: number = Number(process.env.PORT) || 3000) => {
  return app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`API documentation available at http://localhost:${port}/api-docs`);
  });
};

if (require.main === module) {
  startServer();
} 