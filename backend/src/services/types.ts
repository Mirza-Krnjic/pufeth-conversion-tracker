// Interface for conversion rate data point
export interface ConversionRatePoint {
  timestamp: Date;
  rate: number;
  totalAssets: string;
  totalSupply: string;
}

// Interface for conversion rate query parameters
export interface ConversionRateQueryParams {
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}

// Interface for conversion rate statistics
export interface ConversionRateStats {
  min: number;
  max: number;
  average: number;
  latest: number;
  count: number;
} 