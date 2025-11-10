import Transaction from '../models/Transaction.js';
import database from '../utils/database.js';

class TransactionService {
  getCollection() {
    return database.getDb().collection('transactions');
  }

  async getAllTransactions(userId) {
    const transactions = await this.getCollection().find({ userId }).toArray();
    return transactions;
  }

  async getTransactionById(id, userId) {
    const transaction = await this.getCollection().findOne({ _id: id, userId });
    if (!transaction) {
      const error = new Error('Transaction not found');
      error.name = 'NotFoundError';
      throw error;
    }
    return transaction;
  }

  async createTransaction(data, userId) {
    const errors = Transaction.validate(data);
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = errors;
      throw error;
    }

    const transactionData = {
      ...data,
      userId,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await this.getCollection().insertOne(transactionData);
    return { ...transactionData, _id: result.insertedId };
  }

  async updateTransaction(id, data, userId) {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    const result = await this.getCollection().updateOne(
      { id: parseInt(id), userId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      const error = new Error('Transaction not found');
      error.name = 'NotFoundError';
      throw error;
    }
    
    return await this.getTransactionById(parseInt(id), userId);
  }

  async deleteTransaction(id, userId) {
    const result = await this.getCollection().deleteOne({ id: parseInt(id), userId });
    
    if (result.deletedCount === 0) {
      const error = new Error('Transaction not found');
      error.name = 'NotFoundError';
      throw error;
    }
    
    return { message: 'Transaction deleted successfully' };
  }

  async getTransactionsByDateRange(startDate, endDate, userId) {
    const transactions = await this.getCollection().find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).toArray();
    return transactions;
  }

  async clearAllTransactions(userId) {
    await this.getCollection().deleteMany({ userId });
    return { message: 'All transactions cleared successfully' };
  }
}

export default new TransactionService();