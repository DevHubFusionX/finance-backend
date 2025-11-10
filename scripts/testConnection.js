require('dotenv').config();
const connectDB = require('../utils/database');

const testConnection = async () => {
  try {
    console.log('🔍 Testing database connection...');
    await connectDB();
    console.log('✅ Database connection test successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    process.exit(1);
  }
};

testConnection();