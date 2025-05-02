import { InfluxDBClient } from '@influxdata/influxdb3-client';
import { config } from '../config';

const { url, token, bucket } = config.influxdb;

export const getInfluxDB3Client = () => {
  console.log('Connecting to InfluxDB with:', { url, bucket });
  return new InfluxDBClient({ host: url, token, database: bucket });
};

export const closeInfluxDB3Client = (client: InfluxDBClient) => {
  client.close();
};

export async function writeConversionRate(rate: number, timestamp?: number) {
  const client = getInfluxDB3Client();
  try {
    // Use provided timestamp or current time
    const ts = timestamp ? BigInt(timestamp) * BigInt(1000000) : BigInt(Date.now()) * BigInt(1000000);
    const point = `conversion_rate rate=${rate} ${ts}`;
    console.log('Writing point to InfluxDB:', point);
    await client.write(point);
    console.log('Successfully wrote conversion rate point to InfluxDB 3.x');
  } catch (error) {
    console.error('Error writing to InfluxDB:', error);
    throw error;
  } finally {
    closeInfluxDB3Client(client);
  }
}

export async function queryConversionRates(start: Date, end: Date) {
  const client = getInfluxDB3Client();
  try {
    const query = `
      SELECT rate 
      FROM conversion_rate 
      WHERE time >= '${start.toISOString()}' 
      AND time <= '${end.toISOString()}'
      ORDER BY time ASC
    `;
    console.log('Querying InfluxDB:', query);
    const results = await client.query(query);
    const points = [];
    for await (const row of results) {
      points.push({
        timestamp: new Date(row.time),
        rate: row.rate
      });
    }
    return points;
  } finally {
    closeInfluxDB3Client(client);
  }
}

export async function queryRecentConversionRates(limit: number = 10) {
  const client = getInfluxDB3Client();
  try {
    const query = `
      SELECT rate 
      FROM conversion_rate 
      ORDER BY time DESC 
      LIMIT ${limit}
    `;
    console.log('Querying InfluxDB:', query);
    const results = await client.query(query);
    const points = [];
    for await (const row of results) {
      points.push({
        timestamp: new Date(row.time),
        rate: row.rate
      });
    }
    return points;
  } finally {
    closeInfluxDB3Client(client);
  }
} 