const mongoose = require('mongoose');
const { isDemoMode } = require('./dataMode');

// Fail fast instead of buffering operations for 10s when DB is offline
mongoose.set('bufferCommands', false);

/**
 * Safely masks username and password credentials from MongoDB connection strings
 */
function sanitizeMongoUri(rawUri) {
  if (!rawUri || typeof rawUri !== 'string') return '';
  return rawUri.replace(/(mongodb(?:\+srv)?:\/\/)([^:@]+):([^@]+)@/i, '$1***:***@');
}

/**
 * Connect to BYTEXL MongoDB (Active ONLY when DATA_MODE=mongodb)
 */
const connectDB = async () => {
  // In Demo Mode, MongoDB is completely decoupled
  if (isDemoMode()) {
    console.log('💡 [SkillBridge Data Mode]: Running in DEMO MODE.');
    console.log('   MongoDB connection is decoupled. Using high-performance JSON demo repository.');
    return null;
  }

  // Detect connection variable provided by BYTEXL MERN workspace or server/.env
  const candidateVars = [
    'MONGODB_URI',
    'MONGO_URI',
    'MONGO_DB_URI',
    'MONGODB_URL',
    'DATABASE_URL'
  ];

  let uri = null;
  let detectedVar = null;

  for (const varName of candidateVars) {
    if (process.env[varName] && process.env[varName].trim()) {
      uri = process.env[varName].trim();
      detectedVar = varName;
      break;
    }
  }

  if (!uri) {
    console.error('❌ [MongoDB Error]: No MongoDB connection string found.');
    console.error(`   Checked environment variables: ${candidateVars.join(', ')}.`);
    console.error('   Please verify the BYTEXL-provided MongoDB connection variable or define MONGODB_URI in server/.env.');
    return null;
  }

  const sanitized = sanitizeMongoUri(uri);
  console.log(`🔌 [MongoDB Connecting]: Detected '${detectedVar}', Target: ${sanitized}`);

  try {
    const connectOptions = {
      serverSelectionTimeoutMS: 15000
    };
    if (process.env.DB_NAME) {
      connectOptions.dbName = process.env.DB_NAME;
    }
    const conn = await mongoose.connect(uri, connectOptions);

    console.log(`✅ [MongoDB Connected]: Host=${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    return null;
  }
};

module.exports = connectDB;
