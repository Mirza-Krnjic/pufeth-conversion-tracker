import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
const envPath = path.resolve(process.cwd(), '.env.test');
dotenv.config({ path: envPath });

// Mock environment variables if not set
process.env.ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';
process.env.PUFFER_VAULT_ADDRESS = process.env.PUFFER_VAULT_ADDRESS || '0xD9A442856C234a39a81a089C06451EBAa4306a72';
process.env.INFLUXDB_URL = process.env.INFLUXDB_URL || 'https://eu-central-1-1.aws.cloud2.influxdata.com';
process.env.INFLUXDB_TOKEN = process.env.INFLUXDB_TOKEN || 'test-token';
process.env.INFLUXDB_ORG = process.env.INFLUXDB_ORG || 'Test env, Eastern Europe';
process.env.INFLUXDB_BUCKET = process.env.INFLUXDB_BUCKET || '_tasks'; 