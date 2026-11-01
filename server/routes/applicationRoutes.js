const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getApplicationById,
  withdrawApplication
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All application routes require authentication

router.post('/', applyForJob);
router.get('/my', getMyApplications);
router.get('/:id', getApplicationById);
router.put('/:id/withdraw', withdrawApplication);

module.exports = router;
