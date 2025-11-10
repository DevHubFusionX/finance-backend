const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

class TransactionController {
  static async getTransactions(req, res) {
    try {
      const transactions = await Transaction.find({ userId: req.user._id })
        .sort({ date: -1 })
        .limit(100);
      
      res.json(transactions);
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async createTransaction(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const transaction = new Transaction({
        ...req.body,
        userId: req.user._id
      });

      await transaction.save();
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async updateTransaction(req, res) {
    try {
      const transaction = await Transaction.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true }
      );

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json(transaction);
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async deleteTransaction(req, res) {
    try {
      const transaction = await Transaction.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json({ message: 'Transaction deleted' });
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async resetTransactions(req, res) {
    try {
      await Transaction.deleteMany({ userId: req.user._id });
      res.json({ message: 'All transactions deleted' });
    } catch (error) {
      console.error('Reset transactions error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = TransactionController;