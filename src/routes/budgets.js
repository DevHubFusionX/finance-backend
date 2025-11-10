import express from 'express';
import {
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetProgress
} from '../controllers/budgetController.js';

const router = express.Router();

router.get('/', getAllBudgets);
router.get('/progress', getBudgetProgress);
router.get('/:id', getBudgetById);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;