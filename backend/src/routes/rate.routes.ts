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

export function createRateRoutes(
  pufferVaultService: PufferVaultService,
  influxDBService: InfluxDBService
): Router {
  const router = Router();

  // Get current rate
  router.get('/current', async (req: Request, res: Response<ApiResponse<CurrentRateResponse>>, next: NextFunction) => {
    try {
      const rate = await pufferVaultService.getCurrentRate();
      
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
      next(new ApiError(500, 'Failed to fetch current rate', error?.message));
    }
  });

  // Get historical rates
  router.get('/history', 
    validateHistoryQuery,
    async (req: Request<{}, {}, {}, HistoryQueryParams>, res: Response<ApiResponse<HistoryResponse>>, next: NextFunction) => {
      try {
        const { startTime, endTime, limit } = req.query;
        
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
        next(new ApiError(500, 'Failed to fetch historical rates', error?.message));
      }
    }
  );

  // Get rate statistics
  router.get('/stats', async (req: Request, res: Response<ApiResponse<StatsResponse>>, next: NextFunction) => {
    try {
      const stats = await influxDBService.getConversionRateStats();
      const latestRate = await pufferVaultService.getCurrentRate();

      res.json({
        success: true,
        data: {
          ...stats,
          lastUpdated: latestRate.timestamp.toISOString()
        }
      });
    } catch (error: any) {
      next(new ApiError(500, 'Failed to fetch rate statistics', error?.message));
    }
  });

  return router;
} 