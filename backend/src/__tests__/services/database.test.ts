import { InfluxDB } from '@influxdata/influxdb-client';
import { writePoint, queryPoints } from '../../services/database';

// Mock InfluxDB client
jest.mock('@influxdata/influxdb-client', () => ({
  InfluxDB: jest.fn().mockImplementation(() => ({
    getWriteApi: jest.fn().mockReturnValue({
      writePoint: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
    }),
    getQueryApi: jest.fn().mockReturnValue({
      collectRows: jest.fn().mockResolvedValue([
        { _time: '2024-05-02T12:00:00Z', _value: 1.5 },
        { _time: '2024-05-02T12:05:00Z', _value: 1.6 },
      ]),
    }),
  })),
}));

describe('Database Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('writePoint', () => {
    it('should write a point to InfluxDB', async () => {
      const rate = 1.5;
      const timestamp = new Date();

      await writePoint(rate, timestamp);

      const influxDB = new InfluxDB({ url: '', token: '' });
      const writeApi = influxDB.getWriteApi('', '');
      
      expect(writeApi.writePoint).toHaveBeenCalledWith(
        expect.objectContaining({
          _fields: { rate: 1.5 },
          _timestamp: timestamp,
        })
      );
      expect(writeApi.close).toHaveBeenCalled();
    });

    it('should handle errors when writing to InfluxDB', async () => {
      const influxDB = new InfluxDB({ url: '', token: '' });
      const writeApi = influxDB.getWriteApi('', '');
      writeApi.close.mockRejectedValueOnce(new Error('Write failed'));

      await expect(writePoint(1.5, new Date())).rejects.toThrow('Write failed');
    });
  });

  describe('queryPoints', () => {
    it('should query points from InfluxDB', async () => {
      const start = new Date('2024-05-02T12:00:00Z');
      const end = new Date('2024-05-02T12:10:00Z');

      const results = await queryPoints(start, end);

      expect(results).toEqual([
        { timestamp: new Date('2024-05-02T12:00:00Z'), rate: 1.5 },
        { timestamp: new Date('2024-05-02T12:05:00Z'), rate: 1.6 },
      ]);
    });

    it('should handle errors when querying InfluxDB', async () => {
      const influxDB = new InfluxDB({ url: '', token: '' });
      const queryApi = influxDB.getQueryApi('');
      queryApi.collectRows.mockRejectedValueOnce(new Error('Query failed'));

      await expect(queryPoints(new Date(), new Date())).rejects.toThrow('Query failed');
    });
  });
}); 