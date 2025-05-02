import dotenv from 'dotenv';
import path from 'path';

// Load environment variables with explicit path
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Validate required environment variables
const requiredEnvVars = [
  'ETHEREUM_RPC_URL',
  'PUFFER_VAULT_ADDRESS',
  'INFLUXDB_URL',
  'INFLUXDB_TOKEN',
  'INFLUXDB_ORG',
  'INFLUXDB_BUCKET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Export validated environment variables
export const config = {
  ethereum: {
    rpcUrl: process.env.ETHEREUM_RPC_URL!,
    pufferVaultAddress: process.env.PUFFER_VAULT_ADDRESS!
  },
  influxdb: {
    url: process.env.INFLUXDB_URL!,
    token: process.env.INFLUXDB_TOKEN!,
    org: process.env.INFLUXDB_ORG!,
    bucket: process.env.INFLUXDB_BUCKET!
  }
}; 