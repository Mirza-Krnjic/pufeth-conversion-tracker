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
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Log environment variables (excluding sensitive ones)
console.log('Environment variables loaded:');
console.log('ETHEREUM_RPC_URL:', process.env.ETHEREUM_RPC_URL ? 'set' : 'not set');
console.log('PUFFER_VAULT_ADDRESS:', process.env.PUFFER_VAULT_ADDRESS ? 'set' : 'not set');
console.log('INFLUXDB_URL:', process.env.INFLUXDB_URL ? 'set' : 'not set');

// Initialize Express app
export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * @swagger
 * /api/conversion-rate/current:
 *   get:
 *     summary: Get current conversion rate
 *     description: Returns the current pufETH conversion rate
 *     responses:
 *       200:
 *         description: Current conversion rate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversionRate'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/conversion-rate/history:
 *   get:
 *     summary: Get historical conversion rates
 *     description: Returns historical pufETH conversion rates within a time range
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start time for historical data
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End time for historical data
 *     responses:
 *       200:
 *         description: Historical conversion rates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ConversionRate'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/conversion-rate/recent:
 *   get:
 *     summary: Get recent conversion rate activity
 *     description: Returns recent pufETH conversion rate activity
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent activities to return
 *     responses:
 *       200:
 *         description: Recent conversion rate activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ConversionRate'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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