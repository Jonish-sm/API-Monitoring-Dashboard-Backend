# API Monitoring Dashboard Backend

A production-ready NestJS backend for monitoring API endpoints with automated health checks, real-time logging, and intelligent alerting.

## 🚀 Features

- 📊 **Endpoint CRUD Management** - Create, read, update, and delete monitored endpoints
- ⏰ **Automated Health Checks** - Background cron jobs check endpoint health every 5 minutes
- 📝 **Comprehensive Logging** - Track response times, status codes, and errors
- 📈 **Analytics Dashboard** - Calculate uptime percentage and average response times
- 🚨 **Smart Alert System** - Automatic alerts for failures, slow responses, and errors
- 🗄️ **PostgreSQL Database** - Reliable data persistence with Drizzle ORM
- 🔐 **Type-Safe** - Full TypeScript support with validation
- 🛡️ **Rate Limiting** - Built-in request throttling to prevent abuse

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or cloud)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd api-monitoring-dashboard-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and update with your settings:
```bash
cp .env.example .env
```

Update the following variables in `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/api_monitoring
PORT=3000
CRON_SCHEDULE=*/5 * * * *
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

4. **Set up the database**

Generate migration files:
```bash
npm run db:generate
```

Push schema to database:
```bash
npm run db:push
```

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

### Production Mode
```bash
npm run build
npm run start:prod
```

## 📚 API Endpoints

### Endpoints Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/endpoints` | Create a new endpoint to monitor |
| GET | `/api/endpoints` | Get all endpoints |
| GET | `/api/endpoints/:id` | Get a specific endpoint |
| PUT | `/api/endpoints/:id` | Update an endpoint |
| DELETE | `/api/endpoints/:id` | Delete an endpoint |

**Example: Create Endpoint**
```bash
curl -X POST http://localhost:3000/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GitHub API",
    "url": "https://api.github.com",
    "method": "GET",
    "expectedStatus": 200,
    "checkInterval": 5
  }'
```

### Health Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health-logs` | Get all health logs (with pagination) |
| GET | `/api/health-logs/endpoint/:id` | Get logs for specific endpoint |
| GET | `/api/health-logs/analytics/:id` | Get analytics for an endpoint |

**Example: Get Analytics**
```bash
curl http://localhost:3000/api/health-logs/analytics/:endpointId?hours=24
```

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | Get all alerts |
| GET | `/api/alerts/endpoint/:id` | Get alerts for specific endpoint |
| PUT | `/api/alerts/:id/acknowledge` | Acknowledge an alert |

## 🔧 Database Management

### View Database Studio
```bash
npm run db:studio
```

### Generate New Migration
```bash
npm run db:generate
```

### Run Migrations
```bash
npm run db:push
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `CRON_SCHEDULE` | Health check frequency (cron format) | `*/5 * * * *` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `*` |
| `THROTTLE_TTL` | Rate limit time window (seconds) | `60` |
| `THROTTLE_LIMIT` | Max requests per time window | `10` |

### Cron Schedule Examples

- Every 1 minute: `*/1 * * * *`
- Every 5 minutes: `*/5 * * * *`
- Every 15 minutes: `*/15 * * * *`
- Every hour: `0 * * * *`

## 🌐 Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. **Important**: Configure environment variables in Vercel dashboard

> **Note**: For background cron jobs on Vercel, you may need to use Vercel Cron Jobs feature or deploy the scheduler separately.

### Railway/Render Deployment

1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

## 🏗️ Project Structure

```
src/
├── alerts/              # Alert management module
├── config/              # Configuration files
├── database/            # Database connection setup
├── endpoints/           # Endpoint CRUD module
│   └── dto/            # Data Transfer Objects
├── health-logs/         # Health logging module
└── scheduler/           # Background cron jobs
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 License

This project is licensed under the UNLICENSED License.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

For support, please open an issue in the repository.
