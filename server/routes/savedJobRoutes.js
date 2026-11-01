const express = require('express');
const router = express.Router();
const {
  saveJob,
  getMySavedJobs,
  removeSavedJob
} = require('../controllers/savedJobController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getMySavedJobs);
router.post('/:jobId', saveJob);
router.delete('/:jobId', removeSavedJob);

module.exports = router;
