import dotenv from 'dotenv';
import path from 'path';

// Load environment variables with explicit path
const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

// Now import other modules after environment variables are loaded
import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import { writePoint, queryPoints } from './services/database';
import swaggerUi from 'swagger-ui-express';
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const port = process.env.PORT || 3000;

// Initialize ethers provider
const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com');
const PUFFER_VAULT_ADDRESS = process.env.PUFFER_VAULT_ADDRESS || '0xD9A442856C234a39a81a089C06451EBAa4306a72';

// ABI for the functions we need
const PUFFER_VAULT_ABI = [
  'function totalAssets() view returns (uint256)',
  'function totalSupply() view returns (uint256)'
];

const pufferVault = new ethers.Contract(PUFFER_VAULT_ADDRESS, PUFFER_VAULT_ABI, provider);

// Background job to update conversion rate
const updateConversionRate = async () => {
  try {
    const totalAssets = await pufferVault.totalAssets();
    const totalSupply = await pufferVault.totalSupply();
    const rate = Number(totalAssets) / Number(totalSupply);
    
    await writePoint(rate, new Date());
  } catch (error) {
    console.error('Error updating conversion rate:', error);
  }
};

// Update every 5 minutes
setInterval(updateConversionRate, 5 * 60 * 1000);
// Initial update
updateConversionRate();

// Swagger setup
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'pufETH Conversion Rate API',
      version: '1.0.0',
      description: 'API for tracking pufETH conversion rates',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/server.ts'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check if the API is running
 *     responses:
 *       200:
 *         description: API is running
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Conversion rate endpoints
/**
 * @swagger
 * /api/conversion-rate/current:
 *   get:
 *     summary: Get current conversion rate
 *     responses:
 *       200:
 *         description: Current conversion rate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rate:
 *                   type: number
 *                   description: Current pufETH conversion rate (totalAssets / totalSupply)
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 change:
 *                   type: number
 *                   description: Percentage change from previous rate
 */
app.get('/api/conversion-rate/current', async (req, res) => {
  try {
    const [totalAssets, totalSupply] = await Promise.all([
      pufferVault.totalAssets(),
      pufferVault.totalSupply()
    ]);

    const rate = Number(ethers.utils.formatEther(totalAssets)) / Number(ethers.utils.formatEther(totalSupply));
    
    res.json({
      rate,
      timestamp: new Date().toISOString(),
      change: 0
    });
  } catch (error) {
    console.error('Error fetching current rate:', error);
    res.status(500).json({ error: 'Failed to fetch current rate' });
  }
});

/**
 * @swagger
 * /api/conversion-rate/history:
 *   get:
 *     summary: Get historical conversion rates
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *         description: Start time in ISO format
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *         description: End time in ISO format
 *     responses:
 *       200:
 *         description: Historical conversion rates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   rate:
 *                     type: number
 *                     description: pufETH conversion rate at the given timestamp
 */
app.get('/api/conversion-rate/history', async (req, res) => {
  try {
    const start = new Date(req.query.start as string || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const end = new Date(req.query.end as string || new Date());
    
    const data = await queryPoints(start, end);
    res.json(data);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

/**
 * @swagger
 * /api/conversion-rate/recent:
 *   get:
 *     summary: Get recent conversion rate activity
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Number of recent entries to return
 *     responses:
 *       200:
 *         description: Recent conversion rate activity
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   rate:
 *                     type: number
 *                     description: pufETH conversion rate
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   change:
 *                     type: number
 *                     description: Percentage change from previous rate
 */
app.get('/api/conversion-rate/recent', async (req, res) => {
  try {
    const { limit = '10' } = req.query;
    const data = [];

    const [totalAssets, totalSupply] = await Promise.all([
      pufferVault.totalAssets(),
      pufferVault.totalSupply()
    ]);

    const currentRate = Number(ethers.utils.formatEther(totalAssets)) / Number(ethers.utils.formatEther(totalSupply));

    for (let i = 0; i < parseInt(limit as string); i++) {
      const timestamp = new Date(Date.now() - i * 5 * 60 * 1000);
      data.push({
        rate: currentRate,
        timestamp: timestamp.toISOString(),
        change: 0
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API documentation available at http://localhost:${port}/api-docs`);
}); 