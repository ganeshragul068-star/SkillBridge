const express = require('express');
const router = express.Router();
const {
  getJobSkillGap,
  getRoleSkillGap
} = require('../controllers/skillGapController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/jobs/:jobId', getJobSkillGap);
router.get('/role/:roleName', getRoleSkillGap);

module.exports = router;
