const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Budget = require('../models/Budget');
require('dotenv').config();

const defaultCategories = [
  { name: 'Food & Dining', type: 'expense', color: '#E53E3E', icon: 'utensils', isDefault: true },
  { name: 'Transportation', type: 'expense', color: '#3182CE', icon: 'car', isDefault: true },
  { name: 'Shopping', type: 'expense', color: '#805AD5', icon: 'shopping-bag', isDefault: true },
  { name: 'Entertainment', type: 'expense', color: '#D69E2E', icon: 'film', isDefault: true },
  { name: 'Bills & Utilities', type: 'expense', color: '#38A169', icon: 'file-text', isDefault: true },
  { name: 'Healthcare', type: 'expense', color: '#E53E3E', icon: 'heart', isDefault: true },
  { name: 'Salary', type: 'income', color: '#38A169', icon: 'dollar-sign', isDefault: true },
  { name: 'Freelance', type: 'income', color: '#3182CE', icon: 'briefcase', isDefault: true }
];

async function seedUserData(userId) {
  console.log(`Seeding data for user: ${userId}`);
  
  // Create default categories for user
  const userCategories = defaultCategories.map(cat => ({
    ...cat,
    userId
  }));
  
  await Category.insertMany(userCategories);
  console.log('✅ Default categories created');
  
  // Create sample transactions
  const sampleTransactions = [
    {
      userId,
      type: 'income',
      amount: 5000,
      category: 'Salary',
      description: 'Monthly salary',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      userId,
      type: 'expense',
      amount: 800,
      category: 'Food & Dining',
      description: 'Groceries and restaurants',
      date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
    },
    {
      userId,
      type: 'expense',
      amount: 600,
      category: 'Transportation',
      description: 'Gas and public transport',
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    }
  ];
  
  await Transaction.insertMany(sampleTransactions);
  console.log('✅ Sample transactions created');
  
  // Create sample budget
  const sampleBudget = {
    userId,
    name: 'Monthly Budget',
    amount: 4000,
    spent: 1400,
    period: 'monthly',
    categories: ['Food & Dining', 'Transportation', 'Shopping'],
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  };
  
  await Budget.create(sampleBudget);
  console.log('✅ Sample budget created');
}

async function initializeDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      // Check if user already has data
      const existingCategories = await Category.findOne({ userId: user._id });
      
      if (!existingCategories) {
        await seedUserData(user._id);
        console.log(`✅ Seeded data for ${user.email}`);
      } else {
        console.log(`⏭️  User ${user.email} already has data`);
      }
    }
    
    console.log('🎉 Database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { seedUserData, initializeDatabase };