import { Router, Request, Response, NextFunction } from 'express';
import { PufferVaultService } from '../contracts/pufferVault.service';
import { InfluxDBService } from '../services/influxdb.service';
import { 
  HistoryQueryParams, 
  ApiResponse, 
  CurrentRateResponse,
  HistoryResponse,
  StatsResponse
} from './types';
import { validateHistoryQuery } from '../middleware/validation.middleware';
import { ApiError } from '../middleware/error.middleware';
import logger from '../config/logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     CurrentRateResponse:
 *       type: object
 *       properties:
 *         rate:
 *           type: number
 *           description: Current conversion rate
 *         totalAssets:
 *           type: number
 *           description: Total assets in the vault
 *         totalSupply:
 *           type: number
 *           description: Total supply of pufETH
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the rate
 *     HistoryResponse:
 *       type: object
 *       properties:
 *         rates:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CurrentRateResponse'
 *         count:
 *           type: number
 *           description: Number of rates returned
 *     StatsResponse:
 *       type: object
 *       properties:
 *         minRate:
 *           type: number
 *           description: Minimum rate in the period
 *         maxRate:
 *           type: number
 *           description: Maximum rate in the period
 *         avgRate:
 *           type: number
 *           description: Average rate in the period
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

export function createRateRoutes(
  pufferVaultService: PufferVaultService,
  influxDBService: InfluxDBService
): Router {
  const router = Router();

  /**
   * @swagger
   * /rates/current:
   *   get:
   *     summary: Get current conversion rate
   *     tags: [Rates]
   *     responses:
   *       200:
   *         description: Current rate data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/CurrentRateResponse'
   *       500:
   *         description: Server error
   */
  router.get('/current', async (req: Request, res: Response<ApiResponse<CurrentRateResponse>>, next: NextFunction) => {
    try {
      const rate = await pufferVaultService.getCurrentRate();
      logger.info('Current rate fetched successfully', { rate: rate.rate });
      
      res.json({
        success: true,
        data: {
          rate: rate.rate,
          totalAssets: rate.totalAssets,
          totalSupply: rate.totalSupply,
          timestamp: rate.timestamp.toISOString()
        }
      });
    } catch (error: any) {
      logger.error('Failed to fetch current rate', { error: error?.message });
      next(new ApiError(500, 'Failed to fetch current rate', error?.message));
    }
  });

  /**
   * @swagger
   * /rates/history:
   *   get:
   *     summary: Get historical conversion rates
   *     tags: [Rates]
   *     parameters:
   *       - in: query
   *         name: startTime
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Start time for the query
   *       - in: query
   *         name: endTime
   *         schema:
   *           type: string
   *           format: date-time
   *         description: End time for the query
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 1000
   *         description: Maximum number of rates to return
   *     responses:
   *       200:
   *         description: Historical rate data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/HistoryResponse'
   *       400:
   *         description: Invalid query parameters
   *       500:
   *         description: Server error
   */
  router.get('/history', 
    validateHistoryQuery,
    async (req: Request<{}, {}, {}, HistoryQueryParams>, res: Response<ApiResponse<HistoryResponse>>, next: NextFunction) => {
      try {
        const { startTime, endTime, limit } = req.query;
        logger.info('Fetching historical rates', { startTime, endTime, limit });
        
        const rates = await influxDBService.queryConversionRates({
          startTime: startTime ? new Date(startTime) : undefined,
          endTime: endTime ? new Date(endTime) : undefined,
          limit: limit ? Number(limit) : undefined
        });

        res.json({
          success: true,
          data: {
            rates: rates.map(rate => ({
              rate: rate.rate,
              totalAssets: rate.totalAssets,
              totalSupply: rate.totalSupply,
              timestamp: rate.timestamp.toISOString()
            })),
            count: rates.length
          }
        });
      } catch (error: any) {
        logger.error('Failed to fetch historical rates', { error: error?.message });
        next(new ApiError(500, 'Failed to fetch historical rates', error?.message));
      }
    }
  );

  /**
   * @swagger
   * /rates/stats:
   *   get:
   *     summary: Get conversion rate statistics
   *     tags: [Rates]
   *     responses:
   *       200:
   *         description: Rate statistics
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/StatsResponse'
   *       500:
   *         description: Server error
   */
  router.get('/stats', async (req: Request, res: Response<ApiResponse<StatsResponse>>, next: NextFunction) => {
    try {
      const stats = await influxDBService.getConversionRateStats();
      const latestRate = await pufferVaultService.getCurrentRate();
      logger.info('Rate statistics fetched successfully', { stats });

      res.json({
        success: true,
        data: {
          ...stats,
          lastUpdated: latestRate.timestamp.toISOString()
        }
      });
    } catch (error: any) {
      logger.error('Failed to fetch rate statistics', { error: error?.message });
      next(new ApiError(500, 'Failed to fetch rate statistics', error?.message));
    }
  });

  return router;
} 