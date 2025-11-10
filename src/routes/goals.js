import express from 'express';
import {
  getAllGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalProgress
} from '../controllers/goalController.js';

const router = express.Router();

router.get('/', getAllGoals);
router.get('/progress', getGoalProgress);
router.get('/:id', getGoalById);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;