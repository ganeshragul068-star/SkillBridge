const express = require('express');
const router = express.Router();
const { getSkills, addSkill, updateSkill, deleteSkill } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All skill endpoints are protected for authenticated user

router.route('/')
  .get(getSkills)
  .post(addSkill);

router.route('/:id')
  .put(updateSkill)
  .delete(deleteSkill);

module.exports = router;
