# JagCodeDevOps Backend

A modern, scalable Node.js 24 backend built with Express.js and TypeScript, integrated with Appwrite for backend services.

## 🚀 Features

- **Node.js 24** - Latest LTS version with modern ES2022 features
- **TypeScript** - Full type safety and modern JavaScript features
- **Express.js** - Fast, unopinionated web framework
- **Appwrite Integration** - User management, databases, and storage
- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - API protection against abuse
- **WebSocket Support** - Real-time communication with Socket.io
- **Comprehensive Error Handling** - Structured error responses
- **Security Middleware** - Helmet, CORS, and validation
- **Modular Architecture** - Clean, maintainable code structure

## 📋 Prerequisites

- Node.js 24.x or higher
- npm or yarn package manager
- Appwrite account and project

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   - Appwrite credentials
   - JWT secret
   - Database URLs
   - API keys

4. **Build the project**
   ```bash
   npm run build
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The server will start on `http://localhost:5000` with hot reload enabled.

### Production Mode
```bash
npm start
```

### Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── routes/           # API route handlers
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   ├── types/            # TypeScript type definitions
│   └── index.ts          # Main application entry point
├── dist/                 # Compiled JavaScript output
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/dashboard` - Get user dashboard
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/settings` - Update user settings

### Cryptocurrency
- `GET /api/crypto/wallet/:address/balance` - Get wallet balance
- `GET /api/crypto/wallet/:address/transactions` - Get wallet transactions
- `GET /api/crypto/marketdata/:symbol` - Get market data
- `GET /api/crypto/overview` - Get market overview
- `GET /api/crypto/top-cryptos` - Get top cryptocurrencies
- `GET /api/crypto/news` - Get crypto news

### NFTs
- `GET /api/nft/collections` - Get NFT collections
- `GET /api/nft/:contractAddress/:tokenId` - Get NFT details
- `GET /api/nft/hunter` - NFT search
- `GET /api/nft/trending` - Get trending NFTs
- `GET /api/nft/analytics/:contractAddress` - Get NFT analytics

### Health Check
- `GET /_health` - Server health status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## 🛡️ Security Features

- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS Protection** - Configurable cross-origin resource sharing
- **Helmet** - Security headers for Express
- **Input Validation** - Request data validation
- **JWT Security** - Secure token-based authentication
- **Error Handling** - No sensitive information leakage in production

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | JWT signing secret | Required |
| `APPWRITE_ENDPOINT` | Appwrite API endpoint | `https://cloud.appwrite.io/v1` |
| `APPWRITE_PROJECT_ID` | Appwrite project ID | Required |
| `APPWRITE_API_KEY` | Appwrite API key | Required |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |

## 📊 Database Schema

The backend uses Appwrite for data storage. Key collections include:

- **users** - User profiles and settings
- **crypto_portfolios** - User cryptocurrency holdings
- **nft_collections** - NFT metadata and ownership
- **transactions** - Transaction history
- **market_data** - Cryptocurrency market information

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📝 API Documentation

The API follows RESTful conventions and returns JSON responses. All error responses include:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build Docker image
docker build -t jagcodedeveops-backend .

# Run container
docker run -p 5000:5000 jagcodedeveops-backend
```

### Environment-Specific Deployments
- **Development**: `npm run dev`
- **Staging**: `NODE_ENV=staging npm start`
- **Production**: `NODE_ENV=production npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: geddes@thewolfai.com.au
- Phone: +610477367348
- Website: jagecodedevops.webflow.io

## 🔄 Changelog

### v1.0.0
- Initial release
- Node.js 24 support
- Appwrite integration
- JWT authentication
- Comprehensive API endpoints
- TypeScript implementation
