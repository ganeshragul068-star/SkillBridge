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
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️  [MongoDB Warning]: Neither MONGO_URI nor MONGODB_URI is defined in environment.');
    console.warn('   Please configure your MongoDB Atlas URI in server/.env');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'skillbridge',
      serverSelectionTimeoutMS: 5000
    });

    console.log(`✅ [MongoDB Atlas Connected]: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    return null;
  }
};

module.exports = connectDB;
