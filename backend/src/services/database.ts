import { InfluxDB, Point } from '@influxdata/influxdb-client';

let influxDB: InfluxDB | null = null;

export const getInfluxDB = () => {
  if (!influxDB) {
    const url = process.env.INFLUXDB_URL || 'https://eu-central-1-1.aws.cloud2.influxdata.com';
    const token = process.env.INFLUXDB_TOKEN;
    const org = process.env.INFLUXDB_ORG || 'Test env, Eastern Europe';
    const bucket = process.env.INFLUXDB_BUCKET || '_tasks';

    if (!token || token.trim() === '') {
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
  const writeApi = getInfluxDB().getWriteApi(process.env.INFLUXDB_ORG || 'Test env, Eastern Europe', process.env.INFLUXDB_BUCKET || '_tasks');
  
  try {
    const point = new Point('conversion_rate')
      .floatField('rate', rate)
      .timestamp(timestamp);

    await writeApi.writePoint(point);
    await writeApi.close();
  } catch (error) {
    try {
      await writeApi.close();
    } catch (closeError) {
      console.error('Error closing write API:', closeError);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to write point to InfluxDB');
  }
};

export const queryPoints = async (start: Date, end: Date) => {
  const queryApi = getInfluxDB().getQueryApi(process.env.INFLUXDB_ORG || 'Test env, Eastern Europe');
  
  try {
    const fluxQuery = `
      from(bucket: "${process.env.INFLUXDB_BUCKET || '_tasks'}")
        |> range(start: ${start.toISOString()}, stop: ${end.toISOString()})
        |> filter(fn: (r) => r._measurement == "conversion_rate")
        |> filter(fn: (r) => r._field == "rate")
    `;

    const results = await queryApi.collectRows(fluxQuery);
    return results.map((row: any) => ({
      timestamp: new Date(row._time),
      rate: Number(row._value)
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to query points from InfluxDB');
  }
}; 