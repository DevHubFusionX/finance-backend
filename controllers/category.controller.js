const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

class CategoryController {
  static async getCategories(req, res) {
    try {
      const categories = await Category.find({ userId: req.user._id })
        .sort({ type: 1, name: 1 });
      
      res.json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async createCategory(req, res) {
    try {
      const category = new Category({
        ...req.body,
        userId: req.user._id
      });

      await category.save();
      res.status(201).json(category);
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const category = await Category.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        updates,
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(category);
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findOne({ _id: id, userId: req.user._id });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      if (category.isDefault) {
        return res.status(400).json({ error: 'Cannot delete default category' });
      }

      const transactionCount = await Transaction.countDocuments({ 
        userId: req.user._id, 
        category: category.name 
      });

      if (transactionCount > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete category with existing transactions',
          transactionCount 
        });
      }

      await category.deleteOne();
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = CategoryController;