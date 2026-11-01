const mongoose = require('mongoose');
const Profile = require('../models/Profile');

const VALID_CATEGORIES = [
  'Programming Languages',
  'Frontend Development',
  'Backend Development',
  'Database',
  'Cloud Computing',
  'AI and Machine Learning',
  'DevOps',
  'Tools and Technologies',
  'Soft Skills',
  'Other'
];

const VALID_PROFICIENCIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

// @desc    Get all skills of the authenticated student
// @route   GET /api/skills
// @access  Private
exports.getSkills = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI in server/.env.');
    }

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(200).json({ success: true, count: 0, data: [], categories: VALID_CATEGORIES });
    }

    let skills = profile.skills || [];

    // Optional category filter query
    if (req.query.category && req.query.category !== 'All') {
      skills = skills.filter(
        (s) => s.category.toLowerCase() === req.query.category.toLowerCase()
      );
    }

    // Optional search term filter query
    if (req.query.search) {
      const q = req.query.search.toLowerCase().trim();
      skills = skills.filter((s) => s.name.toLowerCase().includes(q));
    }

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
      categories: VALID_CATEGORIES,
      proficiencies: VALID_PROFICIENCIES
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a skill to student profile
// @route   POST /api/skills
// @access  Private
exports.addSkill = async (req, res, next) => {
  try {
    const { name, category, proficiency, yearsOfExperience } = req.body;

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('Skill name is required');
    }

    const trimmedName = name.trim();

    let profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await Profile.create({ userId: req.user._id, skills: [] });
    }

    // Case-insensitive duplicate check
    const existingSkill = profile.skills.find(
      (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingSkill) {
      res.status(409);
      throw new Error(`Skill '${trimmedName}' is already added to your profile`);
    }

    // Validate category & proficiency if provided
    const assignedCategory = VALID_CATEGORIES.includes(category) ? category : 'Tools and Technologies';
    const assignedProficiency = VALID_PROFICIENCIES.includes(proficiency) ? proficiency : 'Intermediate';
    const exp = yearsOfExperience !== undefined ? Math.max(0, parseInt(yearsOfExperience, 10) || 0) : 0;

    const newSkill = {
      name: trimmedName,
      category: assignedCategory,
      proficiency: assignedProficiency,
      yearsOfExperience: exp
    };

    profile.skills.push(newSkill);
    await profile.save();

    const addedSkill = profile.skills[profile.skills.length - 1];
    const completion = profile.calculateCompletion();

    res.status(201).json({
      success: true,
      message: `Skill '${trimmedName}' added successfully`,
      data: addedSkill,
      completion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a skill in student profile
// @route   PUT /api/skills/:id
// @access  Private
exports.updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, proficiency, yearsOfExperience } = req.body;

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error('Profile not found');
    }

    const skill = profile.skills.id(id);
    if (!skill) {
      res.status(404);
      throw new Error('Skill not found in your profile');
    }

    if (name && name.trim()) {
      const trimmedName = name.trim();
      // Check if another skill already has this name
      const duplicateOther = profile.skills.find(
        (s) => s._id.toString() !== id && s.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (duplicateOther) {
        res.status(409);
        throw new Error(`Another skill with name '${trimmedName}' already exists in your profile`);
      }
      skill.name = trimmedName;
    }

    if (category) {
      skill.category = VALID_CATEGORIES.includes(category) ? category : skill.category;
    }

    if (proficiency) {
      skill.proficiency = VALID_PROFICIENCIES.includes(proficiency) ? proficiency : skill.proficiency;
    }

    if (yearsOfExperience !== undefined) {
      skill.yearsOfExperience = Math.max(0, parseInt(yearsOfExperience, 10) || 0);
    }

    await profile.save();
    const completion = profile.calculateCompletion();

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: skill,
      completion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a skill from student profile
// @route   DELETE /api/skills/:id
// @access  Private
exports.deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error('Profile not found');
    }

    const skill = profile.skills.id(id);
    if (!skill) {
      res.status(404);
      throw new Error('Skill not found in your profile');
    }

    profile.skills.pull(id);
    await profile.save();
    const completion = profile.calculateCompletion();

    res.status(200).json({
      success: true,
      message: 'Skill removed from profile',
      completion
    });
  } catch (error) {
    next(error);
  }
};
