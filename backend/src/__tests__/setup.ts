import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') });

// Set default environment variables for testing
process.env.INFLUXDB_URL = process.env.INFLUXDB_URL || 'http://localhost:8086';
process.env.INFLUXDB_TOKEN = process.env.INFLUXDB_TOKEN || 'test-token';
process.env.INFLUXDB_ORG = process.env.INFLUXDB_ORG || 'test-org';
process.env.INFLUXDB_BUCKET = process.env.INFLUXDB_BUCKET || 'test-bucket';
process.env.ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || 'http://localhost:8545';
process.env.PUFFER_VAULT_ADDRESS = process.env.PUFFER_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000';

// Mock console.error to avoid noise in test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 