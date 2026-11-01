/**
 * SkillBridge Data Mode Configuration
 * Supported values:
 * - 'demo'    : Decoupled in-memory JSON repository (No MongoDB required)
 * - 'mongodb' : Production MongoDB Atlas / Localhost Mongoose connection
 */

const isDemoMode = () => {
  return (process.env.DATA_MODE || 'demo').toLowerCase() !== 'mongodb';
};

const getDataMode = () => {
  return isDemoMode() ? 'demo' : 'mongodb';
};

module.exports = {
  isDemoMode,
  getDataMode
};
