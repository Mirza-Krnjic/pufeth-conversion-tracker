import { Point, WriteApi, QueryApi, FluxTableMetaData } from '@influxdata/influxdb-client';
import { influxDB, INFLUXDB_CONFIG, CONVERSION_RATE_MEASUREMENT } from '../config/influxdb';
import { ConversionRatePoint, ConversionRateQueryParams, ConversionRateStats } from './types';

export class InfluxDBService {
  private writeApi: WriteApi;
  private queryApi: QueryApi;

  constructor() {
    this.writeApi = influxDB.getWriteApi(INFLUXDB_CONFIG.org, INFLUXDB_CONFIG.bucket, 'ns');
    this.queryApi = influxDB.getQueryApi(INFLUXDB_CONFIG.org);
  }

  // Store a new conversion rate
  async storeConversionRate(data: ConversionRatePoint): Promise<void> {
    const point = new Point(CONVERSION_RATE_MEASUREMENT)
      .timestamp(data.timestamp)
      .floatField('rate', data.rate)
      .stringField('totalAssets', data.totalAssets)
      .stringField('totalSupply', data.totalSupply);

    await this.writeApi.writePoint(point);
    await this.writeApi.flush();
  }

  // Query conversion rates with optional time range and limit
  async queryConversionRates(params: ConversionRateQueryParams = {}): Promise<ConversionRatePoint[]> {
    const { startTime, endTime, limit = 100 } = params;
    
    let fluxQuery = `
      from(bucket: "${INFLUXDB_CONFIG.bucket}")
        |> range(start: ${startTime ? startTime.toISOString() : '-30d'}, stop: ${endTime ? endTime.toISOString() : 'now()'})
        |> filter(fn: (r) => r._measurement == "${CONVERSION_RATE_MEASUREMENT}")
        |> limit(n: ${limit})
    `;

    const results: ConversionRatePoint[] = [];
    
    for await (const {values, tableMeta} of this.queryApi.iterateRows(fluxQuery)) {
      const timeIndex = tableMeta.columns.findIndex(col => col.label === '_time');
      const rateIndex = tableMeta.columns.findIndex(col => col.label === 'rate');
      const assetsIndex = tableMeta.columns.findIndex(col => col.label === 'totalAssets');
      const supplyIndex = tableMeta.columns.findIndex(col => col.label === 'totalSupply');

      const point: ConversionRatePoint = {
        timestamp: new Date(values[timeIndex]),
        rate: Number(values[rateIndex]),
        totalAssets: String(values[assetsIndex]),
        totalSupply: String(values[supplyIndex]),
      };
      results.push(point);
    }

    return results;
  }

  // Get statistics for conversion rates
  async getConversionRateStats(): Promise<ConversionRateStats> {
    const fluxQuery = `
      from(bucket: "${INFLUXDB_CONFIG.bucket}")
        |> range(start: -30d)
        |> filter(fn: (r) => r._measurement == "${CONVERSION_RATE_MEASUREMENT}")
        |> filter(fn: (r) => r._field == "rate")
        |> reduce(
          fn: (r, accumulator) => ({
            min: if r._value < accumulator.min then r._value else accumulator.min,
            max: if r._value > accumulator.max then r._value else accumulator.max,
            sum: accumulator.sum + r._value,
            count: accumulator.count + 1,
            latest: r._value
          }),
          identity: {min: 999999, max: 0, sum: 0, count: 0, latest: 0}
        )
    `;

    const results = await this.queryApi.collectRows(fluxQuery);
    const stats = results[0] as {
      min: number;
      max: number;
      sum: number;
      count: number;
      latest: number;
    };

    return {
      min: stats.min,
      max: stats.max,
      average: stats.sum / stats.count,
      latest: stats.latest,
      count: stats.count,
    };
  }
} 