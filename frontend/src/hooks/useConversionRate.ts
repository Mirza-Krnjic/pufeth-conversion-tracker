import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useCurrentRate = () => {
  return useQuery({
    queryKey: ['conversion-rate', 'current'],
    queryFn: api.getCurrentRate,
  });
};

export const useHistoricalData = (timeRange: string) => {
  return useQuery({
    queryKey: ['conversion-rate', 'history', timeRange],
    queryFn: () => api.getHistoricalData(timeRange),
  });
};

export const useRecentActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: ['conversion-rate', 'recent', limit],
    queryFn: () => api.getRecentActivity(limit),
  });
}; 