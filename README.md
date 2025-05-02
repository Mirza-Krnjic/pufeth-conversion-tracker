# pufETH Conversion Rate Tracker

A full-stack application that tracks and visualizes the pufETH conversion rate over time.

## Project Structure

- `frontend/` - React + Vite frontend application
- `backend/` - Node.js/TypeScript microservice for tracking pufETH conversion rates

## Tech Stack & Why

### Frontend
- **React**: Modern, component-based UI framework
- **Vite**: Fast development server and build tool
- **Material UI (@mui/material)**: Prebuilt, accessible, and responsive UI components
- **TypeScript**: Type safety and better developer experience
- **react-query**: Efficient data fetching and caching
- **recharts**: Powerful charting library for time series data

### Backend
- **Node.js**: Fast, scalable JavaScript runtime
- **Express**: Minimal and flexible web server for REST APIs
- **TypeScript**: Type safety and maintainability
- **ethers**: Interact with Ethereum smart contracts
- **@influxdata/influxdb3-client**: Write/query time series data in InfluxDB 3.x
- **dotenv**: Manage environment variables
- **swagger-ui-express**: API documentation

## How to Run the Project

### 1. Backend
- See [`backend/README.md`](./backend/README.md) for full instructions.
- In summary:
  1. `cd backend`
  2. `npm install`
  3. Configure your `.env` file (see example in backend)
  4. `npm run dev`

### 2. Frontend
- See [`frontend/README.md`](./frontend/README.md) for full instructions.
- In summary:
  1. `cd frontend`
  2. `npm install`
  3. Configure your `.env` file (see example in frontend)
  4. `npm run dev`

## Features
- Real-time and historical tracking of pufETH conversion rate
- Interactive charts and graphs
- REST API for current, historical, and recent rates
- Utility scripts for backfilling and clearing InfluxDB data
- Responsive, user-friendly UI

## Development & Scripts
- Backend utility scripts:
  - `src/scripts/backfill.ts`: Populate InfluxDB with historical/simulated data
  - `src/scripts/clear_influxdb.ts`: Clear all conversion rate data from InfluxDB
- See backend/README.md for details on running these scripts

## Notes
- For demo/testing, historical data may be simulated by the backend unless an archive node is used.
- All code is TypeScript and ready for production with real data sources.
