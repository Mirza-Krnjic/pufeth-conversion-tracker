# Frontend - pufETH Conversion Tracker

## Overview
This frontend is a React application that visualizes the pufETH conversion rate over time. It displays the current rate, a historical chart, and recent activity, and connects to the backend REST API.

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment variables:**
   - Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your backend URL (default: `http://localhost:3000/api`).
3. **Start the frontend:**
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:5173` by default.

## Key Libraries & Why
- **react**: UI framework
- **@mui/material**: Material UI for modern, accessible components
- **react-query**: Data fetching and caching
- **recharts**: Charting library for time series visualization
- **typescript**: Type safety and modern JS features

## Features
- Fetches and displays the current pufETH conversion rate
- Interactive chart for historical rates (last hour, 7 days, 30 days)
- Recent activity table
- Shows formula, contract link, and explanations
- Responsive and user-friendly UI

## API Integration
- The frontend expects the backend to be running and accessible at the URL set in `VITE_API_BASE_URL`.
- Endpoints used:
  - `/conversion-rate/current`
  - `/conversion-rate/history`
  - `/conversion-rate/recent`

## Notes
- For demo/testing, historical data may be simulated by the backend.
- All code is TypeScript and ready for production with real data sources.
