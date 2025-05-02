const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface ConversionRate {
  rate: number;
  timestamp: string;
  change?: number;
}

export interface HistoricalData {
  timestamp: string;
  rate: number;
}

const getTimeRangeParams = (timeRange: string) => {
  const now = new Date();
  let start: Date;

  switch (timeRange) {
    case '1h':
      start = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '24h':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  return {
    start: start.toISOString(),
    end: now.toISOString(),
  };
};

export const api = {
  getCurrentRate: async (): Promise<ConversionRate> => {
    const response = await fetch(`${API_BASE_URL}/conversion-rate/current`);
    if (!response.ok) {
      throw new Error('Failed to fetch current rate');
    }
    return response.json();
  },

  getHistoricalData: async (timeRange: string): Promise<HistoricalData[]> => {
    const { start, end } = getTimeRangeParams(timeRange);
    const response = await fetch(
      `${API_BASE_URL}/conversion-rate/history?start=${start}&end=${end}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch historical data');
    }
    return response.json();
  },

  getRecentActivity: async (limit: number = 10): Promise<ConversionRate[]> => {
    const response = await fetch(`${API_BASE_URL}/conversion-rate/recent?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch recent activity');
    }
    return response.json();
  },
}; 