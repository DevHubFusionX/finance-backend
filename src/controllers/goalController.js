import goalService from '../services/goalService.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const getAllGoals = asyncHandler(async (req, res) => {
  logger.info('Fetching all goals');
  const goals = await goalService.getAllGoals();
  res.json(goals);
});

const getGoalById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info(`Fetching goal with id: ${id}`);
  const goal = await goalService.getGoalById(id);
  res.json(goal);
});

const createGoal = asyncHandler(async (req, res) => {
  logger.info('Creating new goal', { body: req.body });
  const goal = await goalService.createGoal(req.body);
  res.status(201).json(goal);
});

const updateGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info(`Updating goal with id: ${id}`, { body: req.body });
  const goal = await goalService.updateGoal(id, req.body);
  res.json(goal);
});

const deleteGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info(`Deleting goal with id: ${id}`);
  const result = await goalService.deleteGoal(id);
  res.json(result);
});

const getGoalProgress = asyncHandler(async (req, res) => {
  logger.info('Fetching goal progress');
  const progress = await goalService.getGoalProgress();
  res.json(progress);
});

export {
  getAllGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalProgress
};