import { writePoint, queryPoints } from '../../services/database';
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
  });
}); 