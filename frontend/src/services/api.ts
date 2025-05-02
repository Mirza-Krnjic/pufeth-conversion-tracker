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

export const api = {
  getCurrentRate: async (): Promise<ConversionRate> => {
    const response = await fetch(`${API_BASE_URL}/conversion-rate/current`);
    if (!response.ok) {
      throw new Error('Failed to fetch current rate');
    }
    return response.json();
  },

  getHistoricalData: async (timeRange: string): Promise<HistoricalData[]> => {
    const response = await fetch(`${API_BASE_URL}/conversion-rate/history?range=${timeRange}`);
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