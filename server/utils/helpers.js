/**
 * Backend utility functions
 * Phase 2 helper functions for calculations and responses
 */

const formatApiResponse = (success, data = null, message = '') => {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  formatApiResponse
};
