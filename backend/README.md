# Backend - pufETH Conversion Tracker

## Overview
This backend service tracks and stores the pufETH conversion rate, exposes REST API endpoints, and writes historical and real-time data to InfluxDB 3.x. It is written in Node.js/TypeScript.

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values (see below for required variables).
3. **Start the server:**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:3000` by default.

## Environment Variables
- `ETHEREUM_RPC_URL`: Ethereum RPC endpoint (public or archive node)
- `PUFFER_VAULT_ADDRESS`: Address of the PufferVault contract
- `INFLUXDB_URL`: InfluxDB 3.x URL
- `INFLUXDB_TOKEN`: InfluxDB API token
- `INFLUXDB_ORG`: InfluxDB organization
- `INFLUXDB_BUCKET`: InfluxDB bucket name (e.g., `puffeth_bucket`)

## Key Libraries & Why
- **express**: Web server for REST API
- **ethers**: Interact with Ethereum smart contracts
- **@influxdata/influxdb3-client**: Write/query data in InfluxDB 3.x
- **dotenv**: Load environment variables
- **swagger-ui-express**: API documentation
- **typescript**: Type safety and modern JS features

## Utility Scripts

- **Backfill Historical Data**
  - `src/scripts/backfill.ts`: Populates InfluxDB with simulated (or real, if using an archive node) historical conversion rates for the past 30 days.
  - Run with:
    ```bash
    npx ts-node src/scripts/backfill.ts
    ```

- **Clear All Data**
  - `src/scripts/clear_influxdb.ts`: Deletes all data from the `conversion_rate` measurement in your InfluxDB bucket.
  - Run with:
    ```bash
    npx ts-node src/scripts/clear_influxdb.ts
    ```

## API Endpoints
- `/api/conversion-rate/current`: Get and store the current conversion rate
- `/api/conversion-rate/history`: Get historical rates (time range)
- `/api/conversion-rate/recent`: Get recent activity
- `/health`: Health check

## Notes
- For demo/testing, historical data is simulated unless you use an archive node.
- All code is TypeScript and ready for production with real data sources. 