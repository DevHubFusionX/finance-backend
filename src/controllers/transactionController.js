import transactionService from '../services/transactionService.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const getAllTransactions = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || 'anonymous';
  logger.info('Fetching all transactions', { userId });
  const transactions = await transactionService.getAllTransactions(userId);
  res.json(transactions);
});

const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sessionId = sessionStorage.getSessionId(req);
  logger.info(`Fetching transaction with id: ${id}`, { sessionId });
  const transaction = await transactionService.getTransactionById(id, sessionId);
  res.json(transaction);
});

const createTransaction = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || 'anonymous';
  logger.info('Creating new transaction', { body: req.body, userId });
  const transaction = await transactionService.createTransaction(req.body, userId);
  res.status(201).json(transaction);
});

const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sessionId = sessionStorage.getSessionId(req);
  logger.info(`Updating transaction with id: ${id}`, { body: req.body, sessionId });
  const transaction = await transactionService.updateTransaction(id, req.body, sessionId);
  res.json(transaction);
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sessionId = sessionStorage.getSessionId(req);
  logger.info(`Deleting transaction with id: ${id}`, { sessionId });
  const result = await transactionService.deleteTransaction(id, sessionId);
  res.json(result);
});

export {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};