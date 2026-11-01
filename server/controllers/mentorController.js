const mongoose = require('mongoose');
const Mentor = require('../models/Mentor');
const Profile = require('../models/Profile');
const LearningProgress = require('../models/LearningProgress');
const MentorshipRequest = require('../models/MentorshipRequest');
const {
  CAREER_ROLE_PRESETS,
  calculateJobMatch
} = require('../services/matchingService');
const {
  calculateMentorMatch,
  rankMentorsForStudent
} = require('../services/mentorMatchingService');

/**
 * Helper to fetch all acquired skills for student (Profile + Completed Roadmap Competencies)
 */
const getStudentCompleteSkills = async (studentId) => {
  try {
    const profile = await Profile.findOne({
      $or: [{ userId: studentId }, { user: studentId }]
    });
    const skillsList = profile && Array.isArray(profile.skills) ? [...profile.skills] : [];

    // Include competencies marked completed in LearningProgress / Roadmap
    const completedProgress = await LearningProgress.find({
      studentId,
      $or: [{ status: 'completed' }, { progressPercentage: 100 }]
    });

    completedProgress.forEach((p) => {
      if (p.skill && p.skill.trim()) {
        const pSkillNorm = p.skill.trim().toLowerCase();
        const alreadyHas = skillsList.some((s) => {
          const sName = (typeof s === 'string' ? s : s.name || s.skillName || '').trim().toLowerCase();
          return sName === pSkillNorm;
        });
        if (!alreadyHas) {
          skillsList.push({
            name: p.skill.trim(),
            category: 'Technical Skills',
            proficiency: p.currentLevel || 'Intermediate',
            isVerified: true
          });
        }
      }
    });

    return skillsList;
  } catch (err) {
    return [];
  }
};

/**
 * Helper to build student context for matching
 */
const buildStudentContext = async (userId, targetRoleQuery = '') => {
  const profile = await Profile.findOne({
    $or: [{ userId }, { user: userId }]
  });

  const currentSkills = await getStudentCompleteSkills(userId);
  const desiredRole = targetRoleQuery || (profile && (profile.desiredRole || profile.targetRole)) || 'Full Stack MERN Developer';
  const roleRequirements = CAREER_ROLE_PRESETS[desiredRole] || CAREER_ROLE_PRESETS['Full Stack MERN Developer'];
  
  const matchResult = calculateJobMatch(currentSkills, roleRequirements);
  const missingSkills = matchResult.missingSkills || [];

  const careerInterests = (profile && Array.isArray(profile.interests) && profile.interests.length > 0)
    ? profile.interests
    : (profile && Array.isArray(profile.careerInterests) && profile.careerInterests.length > 0)
      ? profile.careerInterests
      : [desiredRole];

  const department = (profile && profile.department) || '';

  return {
    currentSkills,
    missingSkills,
    careerInterests,
    desiredRole,
    department,
    profile
  };
};

// @desc    Get all active mentors with search & filtering
// @route   GET /api/mentors
// @access  Public / Authenticated
exports.getAllMentors = async (req, res, next) => {
  try {
    const {
      search,
      skill,
      industry,
      experience,
      minExperience,
      mode
    } = req.query;

    const filter = {};

    // Standard public view only shows active mentors
    if (!req.user || req.user.role !== 'admin') {
      filter.isActive = true;
    }

    if (industry) {
      filter.industry = new RegExp(industry.trim(), 'i');
    }

    if (mode) {
      filter.preferredMode = mode.toLowerCase().trim();
    }

    const expVal = parseInt(experience || minExperience, 10);
    if (!isNaN(expVal)) {
      filter.yearsOfExperience = { $gte: expVal };
    }

    let mentors = await Mentor.find(filter).lean();

    // Client-side text search & skill filters for flexible demo handling
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      mentors = mentors.filter((m) => {
        const nameMatch = m.name && m.name.toLowerCase().includes(q);
        const titleMatch = m.title && m.title.toLowerCase().includes(q);
        const compMatch = m.company && m.company.toLowerCase().includes(q);
        const bioMatch = m.bio && m.bio.toLowerCase().includes(q);
        const domainMatch = Array.isArray(m.careerDomains) && m.careerDomains.some((d) => d.toLowerCase().includes(q));
        return nameMatch || titleMatch || compMatch || bioMatch || domainMatch;
      });
    }

    if (skill && skill.trim()) {
      const s = skill.trim().toLowerCase();
      mentors = mentors.filter((m) => {
        return Array.isArray(m.technicalSkills) && m.technicalSkills.some((ts) => ts.toLowerCase().includes(s));
      });
    }

    res.status(200).json({
      success: true,
      count: mentors.length,
      data: mentors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single mentor profile by ID
// @route   GET /api/mentors/:id
// @access  Public / Authenticated
exports.getMentorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentor = await Mentor.findById(id).lean();

    if (!mentor) {
      res.status(404);
      throw new Error('Mentor not found');
    }

    res.status(200).json({
      success: true,
      data: mentor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended mentors for authenticated student
// @route   GET /api/mentors/recommendations
// @access  Private (Student)
exports.getRecommendedMentors = async (req, res, next) => {
  try {
    const { role } = req.query;
    const studentContext = await buildStudentContext(req.user._id, role);

    const allMentors = await Mentor.find({ isActive: true }).lean();
    const recommendations = rankMentorsForStudent(studentContext, allMentors);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      desiredRole: studentContext.desiredRole,
      missingSkillsCount: studentContext.missingSkills.length,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed match breakdown for authenticated student against specific mentor
// @route   GET /api/mentors/:id/match-details
// @access  Private (Student)
exports.getMentorMatchDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentor = await Mentor.findById(id).lean();

    if (!mentor) {
      res.status(404);
      throw new Error('Mentor not found');
    }

    const { role } = req.query;
    const studentContext = await buildStudentContext(req.user._id, role);
    const match = calculateMentorMatch(studentContext, mentor);

    res.status(200).json({
      success: true,
      data: {
        mentor,
        match
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN MENTOR MANAGEMENT CONTROLLERS
// ==========================================

// @desc    Create new mentor profile
// @route   POST /api/admin/mentors
// @access  Private (Admin)
exports.createAdminMentor = async (req, res, next) => {
  try {
    const {
      name,
      title,
      email,
      company,
      industry,
      yearsOfExperience,
      technicalSkills,
      areasOfExpertise,
      careerDomains,
      bio,
      availability,
      preferredMode,
      profileImage
    } = req.body;

    if (!name || !title || !email || !company || !industry || !bio) {
      res.status(400);
      throw new Error('Please provide name, title, email, company, industry, and biography');
    }

    const newMentor = await Mentor.create({
      name: name.trim(),
      title: title.trim(),
      email: email.toLowerCase().trim(),
      company: company.trim(),
      industry: industry.trim(),
      yearsOfExperience: parseInt(yearsOfExperience, 10) || 1,
      technicalSkills: Array.isArray(technicalSkills) ? technicalSkills : [],
      areasOfExpertise: Array.isArray(areasOfExpertise) ? areasOfExpertise : [],
      careerDomains: Array.isArray(careerDomains) ? careerDomains : [],
      bio: bio.trim(),
      availability: availability || 'Available',
      preferredMode: preferredMode || 'online',
      profileImage: profileImage || '',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Mentor profile created successfully',
      data: newMentor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update mentor profile
// @route   PUT /api/admin/mentors/:id
// @access  Private (Admin)
exports.updateAdminMentor = async (req, res, next) => {
  try {
    const { id } = req.params;
    let mentor = await Mentor.findById(id);

    if (!mentor) {
      res.status(404);
      throw new Error('Mentor not found');
    }

    const updated = await Mentor.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Mentor profile updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle mentor active status
// @route   PATCH /api/admin/mentors/:id/status
// @access  Private (Admin)
exports.toggleAdminMentorStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentor = await Mentor.findById(id);

    if (!mentor) {
      res.status(404);
      throw new Error('Mentor not found');
    }

    const newStatus = !mentor.isActive;
    mentor.isActive = newStatus;
    await mentor.save();

    res.status(200).json({
      success: true,
      message: `Mentor marked as ${newStatus ? 'active' : 'inactive'}`,
      data: mentor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete mentor profile safely
// @route   DELETE /api/admin/mentors/:id
// @access  Private (Admin)
exports.deleteAdminMentor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentor = await Mentor.findById(id);

    if (!mentor) {
      res.status(404);
      throw new Error('Mentor not found');
    }

    await Mentor.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Mentor deleted successfully',
      data: { _id: id }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mentor activity & request statistics
// @route   GET /api/admin/mentors/stats
// @access  Private (Admin)
exports.getAdminMentorStats = async (req, res, next) => {
  try {
    const [allMentors, allRequests] = await Promise.all([
      Mentor.find({}).lean(),
      MentorshipRequest.find({}).lean()
    ]);

    const totalMentors = allMentors.length;
    const activeMentors = allMentors.filter((m) => m.isActive !== false).length;
    const inactiveMentors = totalMentors - activeMentors;

    const totalRequests = allRequests.length;
    const pendingRequests = allRequests.filter((r) => r.status === 'Pending').length;
    const acceptedRequests = allRequests.filter((r) => r.status === 'Accepted').length;
    const rejectedRequests = allRequests.filter((r) => r.status === 'Rejected').length;
    const cancelledRequests = allRequests.filter((r) => r.status === 'Cancelled').length;

    // Domain breakdown
    const domainCounts = {};
    allMentors.forEach((m) => {
      if (Array.isArray(m.careerDomains)) {
        m.careerDomains.forEach((d) => {
          domainCounts[d] = (domainCounts[d] || 0) + 1;
        });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalMentors,
        activeMentors,
        inactiveMentors,
        totalRequests,
        pendingRequests,
        acceptedRequests,
        rejectedRequests,
        cancelledRequests,
        domainCounts
      }
    });
  } catch (error) {
    next(error);
  }
};
