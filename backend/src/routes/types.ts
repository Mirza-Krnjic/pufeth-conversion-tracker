import { ConversionRateStats } from '../services/types';

// Request types
export interface HistoryQueryParams {
  startTime?: string;  // ISO date string
  endTime?: string;    // ISO date string
  limit?: number;
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CurrentRateResponse {
  rate: number;
  totalAssets: string;
  totalSupply: string;
  timestamp: string;
}

export interface HistoryResponse {
  rates: Array<{
    rate: number;
    totalAssets: string;
    totalSupply: string;
    timestamp: string;
  }>;
  count: number;
}

export interface StatsResponse extends ConversionRateStats {
  lastUpdated: string;
} 