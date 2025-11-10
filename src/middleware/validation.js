const validateTransaction = (req, res, next) => {
  const { type, amount, category, description } = req.body;
  const errors = [];

  if (!type || !['income', 'expense'].includes(type)) {
    errors.push('Type must be either "income" or "expense"');
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (!category || category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (errors.length > 0) {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    error.details = errors;
    return next(error);
  }

  next();
};

const validateInsightQuery = (req, res, next) => {
  const { timeframe } = req.query;
  const validTimeframes = ['7d', '30d', '90d', '1y'];

  if (timeframe && !validTimeframes.includes(timeframe)) {
    const error = new Error('Invalid timeframe. Must be one of: 7d, 30d, 90d, 1y');
    error.name = 'ValidationError';
    return next(error);
  }

  next();
};

export {
  validateTransaction,
  validateInsightQuery
};