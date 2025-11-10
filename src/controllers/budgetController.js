import budgetService from '../services/budgetService.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const getAllBudgets = asyncHandler(async (req, res) => {
  logger.info('Fetching all budgets');
  const budgets = await budgetService.getAllBudgets();
  res.json(budgets);
});

const getBudgetById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info(`Fetching budget with id: ${id}`);
  const budget = await budgetService.getBudgetById(id);
  res.json(budget);
});

const createBudget = asyncHandler(async (req, res) => {
  logger.info('Creating new budget', { body: req.body });
  const budget = await budgetService.createBudget(req.body);
  res.status(201).json(budget);
});

const updateBudget = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info(`Updating budget with id: ${id}`, { body: req.body });
  const budget = await budgetService.updateBudget(id, req.body);
  res.json(budget);
});

const deleteBudget = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info(`Deleting budget with id: ${id}`);
  const result = await budgetService.deleteBudget(id);
  res.json(result);
});

const getBudgetProgress = asyncHandler(async (req, res) => {
  logger.info('Fetching budget progress');
  const progress = await budgetService.getBudgetProgress();
  res.json(progress);
});

export {
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetProgress
};