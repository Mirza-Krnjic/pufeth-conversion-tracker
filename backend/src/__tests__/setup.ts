// Setup file for Jest tests
// Import the *type* if needed, but avoid importing the actual config module here
// import { type AppConfig } from '@/config';

// Set up test environment
beforeAll(() => {
  // Configure test environment
  process.env.NODE_ENV = 'test';
  // Set required env vars if services rely on them directly
  // process.env.ETHEREUM_RPC_URL = 'mock_rpc_url';
  // process.env.PUFFER_VAULT_ADDRESS = 'mock_vault_address';
  // process.env.INFLUXDB_URL = 'mock_influx_url';
  // process.env.INFLUXDB_TOKEN = 'mock_influx_token';
  // process.env.INFLUXDB_DATABASE = 'mock_influx_db';
});

// Clean up after tests
afterAll(() => {
  // Reset environment
  process.env.NODE_ENV = 'development'; // Or whatever your default is
});

// Mock the config module using the correct path
jest.mock('@/config', () => ({
  config: {
    env: 'test',
    port: 3001,
    ethereum: {
      rpcUrl: 'mock_rpc_url_from_config',
      pufferVaultAddress: 'mock_vault_address_from_config',
    },
    influxdb: {
      url: 'mock_influx_url_from_config',
      token: 'mock_influx_token_from_config',
      org: 'mock_influx_org_from_config',
      database: 'mock_influx_database_from_config', // Use 'database' consistent with service
    },
    // Add other necessary config properties with mock values
  }
}));
