import request from 'supertest';
import { ethers } from 'ethers';
import { app } from '../../server';
import { resetConversionService, setProvider, setPufferVault } from '../../services/conversion';

// Mock the database service
jest.mock('../../services/database', () => ({
  writePoint: jest.fn().mockResolvedValue(undefined),
  queryPoints: jest.fn().mockResolvedValue([
    { timestamp: new Date('2024-05-02T12:00:00.000Z'), rate: 1.5 },
    { timestamp: new Date('2024-05-02T12:05:00.000Z'), rate: 1.6 },
  ]),
}));

// Mock ethers
const mockContract = {
  totalAssets: jest.fn(),
  totalSupply: jest.fn(),
};

const mockProvider = {
  getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
};

jest.mock('ethers', () => {
  const actualEthers = jest.requireActual('ethers');
  return {
    ...actualEthers,
    Contract: jest.fn().mockImplementation(() => mockContract),
    JsonRpcProvider: jest.fn().mockImplementation(() => mockProvider),
  };
});

describe('Conversion Rate API', () => {
  beforeEach(() => {
    resetConversionService();
    setProvider(mockProvider as unknown as ethers.JsonRpcProvider);
    setPufferVault(mockContract as unknown as ethers.Contract);
    // Use BigInt for ethers v6 compatibility
    mockContract.totalAssets.mockResolvedValue(BigInt('100000000000000000000')); // 100 ETH
    mockContract.totalSupply.mockResolvedValue(BigInt('50000000000000000000')); // 50 ETH
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 and status ok', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /api/conversion-rate/current', () => {
    it('should return current conversion rate', async () => {
      const response = await request(app).get('/api/conversion-rate/current');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        rate: 2, // 100 / 50 = 2
        timestamp: expect.any(String),
        change: 0
      });
    });

    it('should handle contract errors', async () => {
      mockContract.totalAssets.mockRejectedValueOnce(new Error('Contract call failed'));

      const response = await request(app).get('/api/conversion-rate/current');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Contract call failed' });
    });

    it('should handle unknown errors', async () => {
      mockContract.totalAssets.mockRejectedValueOnce('Unknown error');

      const response = await request(app).get('/api/conversion-rate/current');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to calculate conversion rate' });
    });
  });

  describe('GET /api/conversion-rate/history', () => {
    it('should return historical conversion rates', async () => {
      const start = '2024-05-02T12:00:00.000Z';
      const end = '2024-05-02T12:10:00.000Z';
      
      const response = await request(app)
        .get('/api/conversion-rate/history')
        .query({ start, end });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { timestamp: '2024-05-02T12:00:00.000Z', rate: 1.5 },
        { timestamp: '2024-05-02T12:05:00.000Z', rate: 1.6 },
      ]);
    });

    it('should use default time range if not provided', async () => {
      const response = await request(app).get('/api/conversion-rate/history');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should handle database errors', async () => {
      const { queryPoints } = require('../../services/database');
      queryPoints.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/api/conversion-rate/history');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });

    it('should handle unknown errors', async () => {
      const { queryPoints } = require('../../services/database');
      queryPoints.mockRejectedValueOnce('Unknown error');

      const response = await request(app).get('/api/conversion-rate/history');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch historical data' });
    });
  });

  describe('GET /api/conversion-rate/recent', () => {
    it('should return recent conversion rate activity', async () => {
      const response = await request(app).get('/api/conversion-rate/recent');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(10); // Default limit
      expect(response.body[0]).toEqual({
        rate: 2,
        timestamp: expect.any(String),
        change: 0
      });
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/conversion-rate/recent')
        .query({ limit: '5' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(5);
    });

    it('should handle contract errors', async () => {
      mockContract.totalAssets.mockRejectedValueOnce(new Error('Contract call failed'));

      const response = await request(app).get('/api/conversion-rate/recent');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Contract call failed' });
    });

    it('should handle unknown errors', async () => {
      mockContract.totalAssets.mockRejectedValueOnce('Unknown error');

      const response = await request(app).get('/api/conversion-rate/recent');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to calculate conversion rate' });
    });
  });

  describe('Server startup', () => {
    it('should start server when run directly', async () => {
      // Mock the app.listen function
      const mockServer = { close: jest.fn() };
      const originalListen = app.listen;
      app.listen = jest.fn().mockImplementation((port, callback) => {
        if (callback) callback();
        return mockServer;
      });

      // Import server directly
      const server = require('../../server');
      const { startServer } = server;

      // Start the server
      const result = startServer(3000);

      // Verify server started
      expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function));
      expect(result).toBe(mockServer);

      // Restore original listen function
      app.listen = originalListen;
    });
  });

  afterAll(async () => {
    // Close the server to prevent jest from hanging
    await new Promise<void>((resolve) => {
      const server = app.listen(() => {
        server.close(() => resolve());
      });
    });
  }, 10000); // Increase timeout to 10 seconds
}); 