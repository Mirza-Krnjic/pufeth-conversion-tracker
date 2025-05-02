import { writePoint, queryPoints, testConnection, getInfluxDB } from '../../services/database';
import { InfluxDB, Point } from '@influxdata/influxdb-client';

// Mock InfluxDB client
const mockWriteApi = {
  writePoint: jest.fn(),
  close: jest.fn(),
};

const mockQueryApi = {
  collectRows: jest.fn(),
};

jest.mock('@influxdata/influxdb-client', () => {
  return {
    InfluxDB: jest.fn().mockImplementation(() => ({
      getWriteApi: jest.fn().mockReturnValue(mockWriteApi),
      getQueryApi: jest.fn().mockReturnValue(mockQueryApi),
    })),
    Point: jest.fn().mockImplementation(() => ({
      timestamp: jest.fn().mockReturnThis(),
      floatField: jest.fn().mockReturnThis(),
    })),
  };
});

describe('Database Service', () => {
  beforeEach(() => {
    mockWriteApi.writePoint.mockResolvedValue(undefined);
    mockWriteApi.close.mockResolvedValue(undefined);
    mockQueryApi.collectRows.mockResolvedValue([
      { _time: '2024-05-02T12:00:00.000Z', _value: 1.5 },
      { _time: '2024-05-02T12:05:00.000Z', _value: 1.6 },
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInfluxDB', () => {
    beforeEach(() => {
      // Reset the influxDB instance
      jest.resetModules();
      const database = require('../../services/database');
      database.influxDB = null;
    });

    it('should create new InfluxDB instance if none exists', () => {
      const influxDB = getInfluxDB();
      expect(InfluxDB).toHaveBeenCalled();
      expect(influxDB).toBeDefined();
    });

    it('should reuse existing InfluxDB instance', () => {
      const firstInstance = getInfluxDB();
      const secondInstance = getInfluxDB();
      expect(firstInstance).toBe(secondInstance);
    });

    it('should throw error if token is missing', () => {
      const originalToken = process.env.INFLUXDB_TOKEN;
      process.env.INFLUXDB_TOKEN = '';
      jest.resetModules();
      const database = require('../../services/database');
      database.influxDB = null;

      expect(() => database.getInfluxDB()).toThrow('INFLUXDB_TOKEN is required in environment variables');

      process.env.INFLUXDB_TOKEN = originalToken;
    });
  });

  describe('testConnection', () => {
    it('should return true on successful connection', async () => {
      mockQueryApi.collectRows.mockResolvedValueOnce([{ _time: '2024-05-02T12:00:00.000Z', _value: 1.5 }]);
      const result = await testConnection();
      expect(result).toBe(true);
    });

    it('should return false on connection failure', async () => {
      mockQueryApi.collectRows.mockRejectedValueOnce(new Error('Connection failed'));
      const result = await testConnection();
      expect(result).toBe(false);
    });

    it('should handle non-Error objects', async () => {
      mockQueryApi.collectRows.mockRejectedValueOnce('Unknown error');
      const result = await testConnection();
      expect(result).toBe(false);
    });
  });

  describe('writePoint', () => {
    it('should write point successfully', async () => {
      const rate = 1.5;
      const timestamp = new Date();

      await writePoint(rate, timestamp);

      expect(mockWriteApi.writePoint).toHaveBeenCalled();
      expect(mockWriteApi.close).toHaveBeenCalled();
    });

    it('should handle write errors', async () => {
      const error = new Error('Write failed');
      mockWriteApi.writePoint.mockRejectedValueOnce(error);

      await expect(writePoint(1.5, new Date())).rejects.toThrow('Write failed');
    });

    it('should handle close errors', async () => {
      const error = new Error('Close failed');
      mockWriteApi.close.mockRejectedValueOnce(error);

      await expect(writePoint(1.5, new Date())).rejects.toThrow('Close failed');
    });

    it('should handle unknown errors', async () => {
      mockWriteApi.writePoint.mockRejectedValueOnce('Unknown error');
      await expect(writePoint(1.5, new Date())).rejects.toThrow('Failed to write point to InfluxDB');
    });

    it('should handle write and close errors', async () => {
      const writeError = new Error('Write failed');
      const closeError = new Error('Close failed');
      mockWriteApi.writePoint.mockRejectedValueOnce(writeError);
      mockWriteApi.close.mockRejectedValueOnce(closeError);

      await expect(writePoint(1.5, new Date())).rejects.toThrow('Write failed');
    });
  });

  describe('queryPoints', () => {
    it('should query points successfully', async () => {
      const start = new Date('2024-05-02T12:00:00.000Z');
      const end = new Date('2024-05-02T12:10:00.000Z');

      const result = await queryPoints(start, end);

      expect(result).toEqual([
        { timestamp: new Date('2024-05-02T12:00:00.000Z'), rate: 1.5 },
        { timestamp: new Date('2024-05-02T12:05:00.000Z'), rate: 1.6 },
      ]);
    });

    it('should handle query errors', async () => {
      const error = new Error('Query failed');
      mockQueryApi.collectRows.mockRejectedValueOnce(error);

      await expect(queryPoints(new Date(), new Date())).rejects.toThrow('Query failed');
    });

    it('should handle empty results', async () => {
      mockQueryApi.collectRows.mockResolvedValueOnce([]);
      const result = await queryPoints(new Date(), new Date());
      expect(result).toEqual([]);
    });

    it('should handle unknown errors', async () => {
      mockQueryApi.collectRows.mockRejectedValueOnce('Unknown error');
      await expect(queryPoints(new Date(), new Date())).rejects.toThrow('Failed to query points from InfluxDB');
    });
  });
}); 