const express = require('express');
const { body } = require('express-validator');
const CategoryController = require('../controllers/category.controller');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, CategoryController.getCategories);

router.post('/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense')
  ],
  CategoryController.createCategory
);

router.put('/:id', auth, CategoryController.updateCategory);

router.delete('/:id', auth, CategoryController.deleteCategory);

module.exports = router;