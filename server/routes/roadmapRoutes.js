const express = require('express');
const router = express.Router();
const {
  getRoadmap,
  createRoadmap,
  updateRoadmapStep,
  deleteRoadmapStep
} = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getRoadmap)
  .post(createRoadmap);

router.route('/:id')
  .put(updateRoadmapStep)
  .delete(deleteRoadmapStep);

module.exports = router;
