const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const goalController = require('../controllers/goal.controller');

router.get('/', auth, goalController.getGoals);

router.post('/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Goal name is required'),
    body('targetAmount').isFloat({ min: 0 }).withMessage('Target amount must be positive'),
    body('deadline').isISO8601().withMessage('Valid deadline is required')
  ],
  goalController.createGoal
);

router.put('/:id', auth, goalController.updateGoal);

router.delete('/:id', auth, goalController.deleteGoal);

router.patch('/:id/progress',
  auth,
  [body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive')],
  goalController.updateProgress
);

module.exports = router;
