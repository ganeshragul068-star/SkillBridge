const express = require('express');
const router = express.Router();
const {
  getProgress,
  createProgress,
  updateProgress,
  deleteProgress,
  getProgressDashboard
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getProgressDashboard);

router.route('/')
  .get(getProgress)
  .post(createProgress);

router.route('/:id')
  .put(updateProgress)
  .delete(deleteProgress);

module.exports = router;
