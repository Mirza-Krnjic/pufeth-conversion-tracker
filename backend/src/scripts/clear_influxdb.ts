import { config } from '../config';
import { InfluxDBClient } from '@influxdata/influxdb3-client';

async function clearDatabase() {
  const { url, token, bucket } = config.influxdb;
  const client = new InfluxDBClient({ host: url, token, database: bucket });

  try {
    const query = `DELETE FROM conversion_rate`;
    console.log('Running query:', query);
    await client.query(query);
    console.log('All data deleted from measurement conversion_rate in bucket', bucket);
  } catch (error) {
    console.error('Error deleting data:', error);
  } finally {
    client.close();
  }
}

clearDatabase().catch(console.error); 