import { InfluxDB } from '@influxdata/influxdb-client';

// InfluxDB configuration
export const INFLUXDB_CONFIG = {
  url: process.env.INFLUXDB_URL || 'http://localhost:8086',
  token: process.env.INFLUXDB_TOKEN || 'your-token-here',
  org: process.env.INFLUXDB_ORG || 'puffer',
  bucket: process.env.INFLUXDB_BUCKET || 'pufeth_rates',
};

// Create InfluxDB client instance
export const influxDB = new InfluxDB({
  url: INFLUXDB_CONFIG.url,
  token: INFLUXDB_CONFIG.token,
});

// Measurement name for our conversion rates
export const CONVERSION_RATE_MEASUREMENT = 'pufeth_conversion_rate';

// Default retention period (30 days)
export const DEFAULT_RETENTION_PERIOD = '30d'; 

console.log('InfluxDB URL:', process.env.INFLUXDB_URL);