import express from 'express';
import { validateTransaction } from '../middleware/validation.js';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController.js';

const router = express.Router();

router.get('/', getAllTransactions);
router.get('/:id', getTransactionById);
router.post('/', validateTransaction, createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.delete('/', (req, res) => {
  // Clear all transactions
  const transactionService = req.app.get('transactionService');
  if (transactionService) {
    transactionService.transactions = [];
  }
  res.json({ message: 'All transactions cleared' });
});

export default router;