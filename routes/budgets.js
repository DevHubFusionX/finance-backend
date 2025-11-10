const express = require('express');
const { body } = require('express-validator');
const BudgetController = require('../controllers/budget.controller');
const { auth } = require('../middleware/auth');

const router = express.Router();

const budgetValidation = [
  body('name').notEmpty().withMessage('Budget name is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be greater than 0'),
  body('period').isIn(['weekly', 'monthly', 'yearly']).withMessage('Invalid period'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date')
];

router.get('/', auth, BudgetController.getBudgets);
router.post('/', auth, budgetValidation, BudgetController.createBudget);
router.put('/:id', auth, BudgetController.updateBudget);
router.delete('/:id', auth, BudgetController.deleteBudget);

module.exports = router;