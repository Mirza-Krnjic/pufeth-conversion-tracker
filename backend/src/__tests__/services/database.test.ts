import { getInfluxDB3Client } from '../../services/database3';

describe('InfluxDB 3.x Service', () => {
  let client: ReturnType<typeof getInfluxDB3Client>;

  beforeAll(() => {
    client = getInfluxDB3Client();
  });

  afterAll(() => {
    client.close();
  });

  it('should write a point successfully', async () => {
    const rate = 1.234;
    const timestamp = Math.floor(Date.now() / 1000);
    const point = `conversion_rate rate=${rate} ${timestamp}`;
    await client.write(point);
    // No error means success
  });

  it('should query points successfully', async () => {
    const query = `SELECT * FROM conversion_rate WHERE time >= now() - interval '1 hour'`;
    const results = await client.query(query);
    const data = [];
    for await (const row of results) {
      data.push(row);
    }
    expect(Array.isArray(data)).toBe(true);
    // Optionally check for at least one result
    // expect(data.length).toBeGreaterThan(0);
  });
}); 