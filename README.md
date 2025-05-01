# PufETH Conversion Rate Tracker

A microservice for tracking and analyzing PufETH conversion rates, providing real-time and historical data through a RESTful API.

## Features

- Real-time PufETH conversion rate tracking
- Historical rate data storage and querying
- Rate statistics and analytics
- RESTful API with OpenAPI documentation
- Structured logging
- Health monitoring

## Technology Stack

### Backend
- **Node.js with Express**: Fast, unopinionated web framework for building the API
- **TypeScript**: For type safety and better developer experience
- **InfluxDB**: Time-series database optimized for storing and querying rate data
- **ethers.js**: Ethereum library for interacting with the PufferVault contract
- **Winston**: Structured logging for production-grade monitoring
- **Swagger/OpenAPI**: API documentation and testing interface
- **express-validator**: Input validation middleware for API endpoints

### Development Tools
- **Vite**: Next-generation frontend build tool
- **React**: UI library for building the frontend
- **Jest**: Testing framework
- **ESLint & Prettier**: Code quality and formatting

## Project Structure

```
pufeth-conversion-tracker/
├── backend/
│   ├── src/
│   │   ├── contracts/         # Ethereum contract integration
│   │   ├── services/          # Business logic services
│   │   ├── routes/            # API route handlers
│   │   ├── middleware/        # Express middleware
│   │   ├── config/            # Configuration files
│   │   └── background/        # Background services
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/        # React components
    │   ├── pages/            # Page components
    │   ├── services/         # API service
    │   ├── hooks/            # Custom React hooks
    │   └── utils/            # Utility functions
    ├── package.json
    └── vite.config.ts
```

## API Endpoints

### Rates
- `GET /rates/current` - Get current conversion rate
- `GET /rates/history` - Get historical rates with optional filters
- `GET /rates/stats` - Get rate statistics

### System
- `GET /health` - Health check endpoint
- `GET /api-docs` - Swagger API documentation

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- InfluxDB (for data storage)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pufeth-conversion-tracker.git
cd pufeth-conversion-tracker
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables:
```bash
# Backend (.env)
ETHEREUM_RPC_URL=your_ethereum_rpc_url
INFLUXDB_URL=your_influxdb_url
INFLUXDB_TOKEN=your_influxdb_token
INFLUXDB_ORG=your_influxdb_org
INFLUXDB_BUCKET=your_influxdb_bucket
PORT=3000
```

### Running the Application

1. Start the backend:
```bash
cd backend
npm run dev
```

2. Start the frontend:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs
- Frontend: http://localhost:5173

## Development

### Backend Development
- The backend is built with TypeScript for type safety
- Uses Express for routing and middleware
- InfluxDB for time-series data storage
- Winston for structured logging
- Swagger for API documentation

### Frontend Development
- Built with React and TypeScript
- Uses Vite for fast development and building
- Implements responsive design
- Real-time data updates

## Testing

Run tests:
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 