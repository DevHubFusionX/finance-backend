const express = require('express');
const { body } = require('express-validator');
const TransactionController = require('../controllers/transaction.controller');
const { auth } = require('../middleware/auth');

const router = express.Router();

const transactionValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').notEmpty().withMessage('Description is required')
];

router.get('/', auth, TransactionController.getTransactions);
router.post('/', auth, transactionValidation, TransactionController.createTransaction);
router.put('/:id', auth, TransactionController.updateTransaction);
router.delete('/:id', auth, TransactionController.deleteTransaction);
router.delete('/', auth, TransactionController.resetTransactions);
router.delete('/', auth, TransactionController.resetTransactions);

module.exports = router;