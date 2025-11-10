# Finance Backend API

A modular Node.js backend for the finance dashboard application.

## Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── transactionController.js
│   └── insightController.js
├── services/            # Business logic
│   ├── transactionService.js
│   └── insightService.js
├── models/              # Data models
│   └── Transaction.js
├── middleware/          # Custom middleware
│   ├── errorHandler.js
│   └── validation.js
├── routes/              # API routes
│   ├── transactions.js
│   └── insights.js
└── utils/               # Utility functions
    ├── logger.js
    └── asyncHandler.js
```

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Insights
- `GET /api/insights?timeframe=30d` - Get financial insights
- `POST /api/insights/forecast` - Generate spending forecast

### Categories
- `GET /api/categories` - Get all categories

## Error Handling

The API uses centralized error handling with:
- Custom error types (ValidationError, NotFoundError)
- Structured error responses
- Request/response logging
- Async error catching

## Development

```bash
npm run dev    # Start development server
npm start      # Start production server
```

## Environment Variables

```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```