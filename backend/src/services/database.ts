import { InfluxDB, Point } from '@influxdata/influxdb-client';

let influxDB: InfluxDB | null = null;

const getInfluxDB = () => {
  if (!influxDB) {
    const url = process.env.INFLUXDB_URL || 'https://eu-central-1-1.aws.cloud2.influxdata.com';
    const token = process.env.INFLUXDB_TOKEN;
    const org = process.env.INFLUXDB_ORG || 'Test env, Eastern Europe';
    const bucket = process.env.INFLUXDB_BUCKET || '_tasks';

    if (!token) {
      throw new Error('INFLUXDB_TOKEN is required in environment variables');
    }

    influxDB = new InfluxDB({ url, token });
  }
  return influxDB;
};

// Test the connection
export const testConnection = async () => {
  try {
    const queryApi = getInfluxDB().getQueryApi(process.env.INFLUXDB_ORG || 'Test env, Eastern Europe');
    await queryApi.collectRows(`from(bucket: "${process.env.INFLUXDB_BUCKET || '_tasks'}") |> range(start: -1h) |> limit(n:1)`);
    return true;
  } catch (error) {
    console.error('InfluxDB Connection Test Failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if ('json' in error) {
        console.error('Error response:', (error as any).json);
      }
    }
    return false;
  }
};

export const writePoint = async (rate: number, timestamp: Date) => {
  try {
    const writeApi = getInfluxDB().getWriteApi(process.env.INFLUXDB_ORG || 'Test env, Eastern Europe', process.env.INFLUXDB_BUCKET || '_tasks');
    
    const point = new Point('conversion_rate')
      .floatField('rate', rate)
      .timestamp(timestamp);

    writeApi.writePoint(point);
    await writeApi.close();
  } catch (error) {
    console.error('Error writing to InfluxDB:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if ('json' in error) {
        console.error('Error response:', (error as any).json);
      }
    }
    throw error;
  }
};

export const queryPoints = async (start: Date, end: Date) => {
  try {
    const queryApi = getInfluxDB().getQueryApi(process.env.INFLUXDB_ORG || 'Test env, Eastern Europe');
    
    const fluxQuery = `
      from(bucket: "${process.env.INFLUXDB_BUCKET || '_tasks'}")
        |> range(start: ${start.toISOString()}, stop: ${end.toISOString()})
        |> filter(fn: (r) => r._measurement == "conversion_rate")
        |> filter(fn: (r) => r._field == "rate")
    `;

    const results = await queryApi.collectRows(fluxQuery);
    return results.map((row: any) => ({
      timestamp: new Date(row._time),
      rate: row._value
    }));
  } catch (error) {
    console.error('Error querying InfluxDB:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if ('json' in error) {
        console.error('Error response:', (error as any).json);
      }
    }
    throw error;
  }
}; 