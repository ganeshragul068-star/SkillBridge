const mongoose = require('mongoose');
const { isDemoMode } = require('./dataMode');

// Fail fast instead of buffering operations for 10s when DB is offline
mongoose.set('bufferCommands', false);

/**
 * Connect to MongoDB Atlas (Active ONLY when DATA_MODE=mongodb)
 */
const connectDB = async () => {
  // In Demo Mode, MongoDB is completely decoupled
  if (isDemoMode()) {
    console.log('💡 [SkillBridge Data Mode]: Running in DEMO MODE.');
    console.log('   MongoDB connection is decoupled. Using high-performance JSON demo repository.');
    return null;
  }

  // MongoDB Mode
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ [MongoDB Error]: Neither MONGODB_URI nor MONGO_URI is defined in environment.');
    console.error('   Please configure your BYTEXL MongoDB URI in server/.env or workspace environment.');
    return null;
  }

  const sanitized = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log(`🔌 [MongoDB Connecting]: Target ${sanitized}`);

  try {
    const conn = await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || 'skillbridge',
      serverSelectionTimeoutMS: 5000
    });

    console.log(`✅ [MongoDB Connected]: Host=${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    return null;
  }
};

module.exports = connectDB;
