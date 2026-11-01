const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { isDemoMode, getDataMode } = require('./config/dataMode');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const mode = getDataMode();

  if (isDemoMode()) {
    console.log('=======================================================');
    console.log(` 🚀 SkillBridge Backend API Server running on port ${PORT}`);
    console.log(`    Mode        : DEMO MODE (Decoupled JSON Repository)`);
    console.log(`    Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`    Health Check: http://localhost:${PORT}/api/health`);
    console.log('=======================================================');
    app.listen(PORT);
  } else {
    try {
      await connectDB();
      const server = app.listen(PORT, () => {
        console.log('=======================================================');
        console.log(` 🚀 SkillBridge Backend API Server running on port ${PORT}`);
        console.log(`    Mode        : MONGODB MODE`);
        console.log(`    Environment : ${process.env.NODE_ENV || 'development'}`);
        console.log(`    Health Check: http://localhost:${PORT}/api/health`);
        console.log('=======================================================');
      });
    } catch (err) {
      console.error(`Database initialization failure: ${err.message}`);
    }
  }

  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
  });
};

startServer();
