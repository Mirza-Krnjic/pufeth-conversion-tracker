import { Router, Request, Response } from 'express';
import { PufferVaultService } from '../contracts/pufferVault.service';
import { InfluxDBService } from '../services/influxdb.service';
import { 
  HistoryQueryParams, 
  ApiResponse, 
  CurrentRateResponse,
  HistoryResponse,
  StatsResponse
} from './types';

export function createRateRoutes(
  pufferVaultService: PufferVaultService,
  influxDBService: InfluxDBService
): Router {
  const router = Router();

  // Get current rate
  router.get('/current', async (req: Request, res: Response<ApiResponse<CurrentRateResponse>>) => {
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
      res.status(500).json({
        success: false,
        error: error?.message || 'Failed to fetch current rate'
      });
    }
  });

  // Get historical rates
  router.get('/history', async (req: Request<{}, {}, {}, HistoryQueryParams>, res: Response<ApiResponse<HistoryResponse>>) => {
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
      res.status(500).json({
        success: false,
        error: error?.message || 'Failed to fetch historical rates'
      });
    }
  });

  // Get rate statistics
  router.get('/stats', async (req: Request, res: Response<ApiResponse<StatsResponse>>) => {
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
      res.status(500).json({
        success: false,
        error: error?.message || 'Failed to fetch rate statistics'
      });
    }
  });

  return router;
} 