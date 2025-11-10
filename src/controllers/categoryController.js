import categoryService from '../services/categoryService.js';
import sessionStorage from '../utils/sessionStorage.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const getAllCategories = asyncHandler(async (req, res) => {
  const sessionId = sessionStorage.getSessionId(req);
  logger.info('Fetching all categories', { sessionId });
  const categories = await categoryService.getAllCategories(sessionId);
  res.json(categories);
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info(`Fetching category with id: ${id}`);
  const category = await categoryService.getCategoryById(id);
  res.json(category);
});

const createCategory = asyncHandler(async (req, res) => {
  logger.info('Creating new category', { body: req.body });
  const category = await categoryService.createCategory(req.body);
  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info(`Updating category with id: ${id}`, { body: req.body });
  const category = await categoryService.updateCategory(id, req.body);
  res.json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info(`Deleting category with id: ${id}`);
  const result = await categoryService.deleteCategory(id);
  res.json(result);
});

const getCategoryStats = asyncHandler(async (req, res) => {
  const sessionId = sessionStorage.getSessionId(req);
  logger.info('Fetching category statistics', { sessionId });
  const stats = await categoryService.getCategoryStats(sessionId);
  res.json(stats);
});

const resetCategories = asyncHandler(async (req, res) => {
  logger.info('Resetting categories to defaults');
  const result = await categoryService.clearAllCategories();
  res.json(result);
});

export {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  resetCategories
};