const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const User = require('../models/User');

// Helper to validate basic URL formats
const isValidUrl = (string) => {
  if (!string || string.trim() === '') return true;
  try {
    const url = new URL(string.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

// @desc    Get current user profile with dynamic completion metrics
// @route   GET /api/profiles/me
// @access  Private (Student / Admin)
exports.getProfileMe = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI in server/.env.');
    }

    let profile = await Profile.findOne({ userId: req.user._id }).populate('userId', 'name email role createdAt');

    if (!profile) {
      profile = await Profile.create({
        userId: req.user._id,
        skills: [],
        education: [],
        projects: [],
        certifications: []
      });
      profile = await profile.populate('userId', 'name email role createdAt');
    }

    const completion = profile.calculateCompletion(profile.userId ? profile.userId.name : req.user.name);

    res.status(200).json({
      success: true,
      data: {
        ...profile.toObject(),
        completion
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current student personal & academic information
// @route   PUT /api/profiles/me
// @access  Private
exports.updateProfileMe = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI in server/.env.');
    }

    // Explicitly reject tampering with email or role
    if (req.body.email || req.body.role || req.body.isActive) {
      // Stripping or rejecting unauthorized privilege escalation
      delete req.body.email;
      delete req.body.role;
      delete req.body.isActive;
    }

    const allowedFields = [
      'phone',
      'college',
      'department',
      'degree',
      'graduationYear',
      'location',
      'bio',
      'profileImage',
      'interests'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] === 'string') {
          updates[field] = req.body[field].trim();
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    // Phone format check if provided
    if (updates.phone && updates.phone.length > 25) {
      res.status(400);
      throw new Error('Phone number must not exceed 25 characters');
    }

    // Graduation year check
    if (updates.graduationYear !== undefined) {
      const year = parseInt(updates.graduationYear, 10);
      if (isNaN(year) || year < 1970 || year > 2040) {
        res.status(400);
        throw new Error('Graduation year must be a valid 4-digit year between 1970 and 2040');
      }
      updates.graduationYear = year;
    }

    // Bio length check
    if (updates.bio && updates.bio.length > 2000) {
      res.status(400);
      throw new Error('Biography cannot exceed 2000 characters');
    }

    let profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true, upsert: true }
    ).populate('userId', 'name email role');

    // Update student's name on User record if supplied
    if (req.body.name && req.body.name.trim()) {
      await User.findByIdAndUpdate(req.user._id, { name: req.body.name.trim() });
      profile = await Profile.findOne({ userId: req.user._id }).populate('userId', 'name email role');
    }

    const completion = profile.calculateCompletion(profile.userId ? profile.userId.name : req.user.name);

    res.status(200).json({
      success: true,
      message: 'Personal profile updated successfully',
      data: {
        ...profile.toObject(),
        completion
      }
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// EDUCATION CRUD
// =========================================================================

// @desc    Add education credential
// @route   POST /api/profiles/education
// @access  Private
exports.addEducation = async (req, res, next) => {
  try {
    const { institution, degree, department, fieldOfStudy, startYear, endYear, grade } = req.body;

    if (!institution || !institution.trim()) {
      res.status(400);
      throw new Error('Institution name is required');
    }

    if (!degree || !degree.trim()) {
      res.status(400);
      throw new Error('Degree is required');
    }

    let profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await Profile.create({ userId: req.user._id, education: [] });
    }

    const newEdu = {
      institution: institution.trim(),
      degree: degree.trim(),
      department: (department || fieldOfStudy || '').trim(),
      fieldOfStudy: (fieldOfStudy || department || '').trim(),
      startYear: startYear ? parseInt(startYear, 10) : undefined,
      endYear: endYear ? parseInt(endYear, 10) : undefined,
      grade: grade ? grade.trim() : ''
    };

    profile.education.unshift(newEdu);
    await profile.save();

    const createdEdu = profile.education[0];
    const completion = profile.calculateCompletion();

    res.status(201).json({
      success: true,
      message: 'Education record added successfully',
      data: createdEdu,
      completion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update education credential
// @route   PUT /api/profiles/education/:eduId
// @access  Private
exports.updateEducation = async (req, res, next) => {
  try {
    const { eduId } = req.params;
    const { institution, degree, department, fieldOfStudy, startYear, endYear, grade } = req.body;

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error('Profile not found');
    }

    const eduItem = profile.education.id(eduId);
    if (!eduItem) {
      res.status(404);
      throw new Error('Education record not found');
    }

    if (institution !== undefined) eduItem.institution = institution.trim();
    if (degree !== undefined) eduItem.degree = degree.trim();
    if (department !== undefined || fieldOfStudy !== undefined) {
      eduItem.department = (department || fieldOfStudy || '').trim();
      eduItem.fieldOfStudy = (fieldOfStudy || department || '').trim();
    }
    if (startYear !== undefined) eduItem.startYear = parseInt(startYear, 10);
    if (endYear !== undefined) eduItem.endYear = parseInt(endYear, 10);
    if (grade !== undefined) eduItem.grade = grade.trim();

    await profile.save();
    const completion = profile.calculateCompletion();

    res.status(200).json({
      success: true,
      message: 'Education record updated successfully',
      data: eduItem,
      completion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete education credential
// @route   DELETE /api/profiles/education/:eduId
// @access  Private
exports.deleteEducation = async (req, res, next) => {
  try {
    const { eduId } = req.params;

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error('Profile not found');
    }

    const eduItem = profile.education.id(eduId);
    if (!eduItem) {
      res.status(404);
      throw new Error('Education record not found');
    }

    profile.education.pull(eduId);
    await profile.save();
    const completion = profile.calculateCompletion();

    res.status(200).json({
      success: true,
      message: 'Education record removed successfully',
      completion
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// PROJECTS CRUD
// =========================================================================

// @desc    Add portfolio project
// @route   POST /api/profiles/projects
// @access  Private
exports.addProject = async (req, res, next) => {
  try {
    const { title, description, technologies, techStack, projectUrl, liveUrl, githubUrl, completionDate } = req.body;

    if (!title || !title.trim()) {
      res.status(400);
      throw new Error('Project title is required');
    }

    const finalProjectUrl = (projectUrl || liveUrl || '').trim();
    const finalGithubUrl = (githubUrl || '').trim();

    if (finalProjectUrl && !isValidUrl(finalProjectUrl)) {
      res.status(400);
      throw new Error('Please provide a valid project URL (e.g. https://myproject.com)');
    }

    if (finalGithubUrl && !isValidUrl(finalGithubUrl)) {
      res.status(400);
      throw new Error('Please provide a valid GitHub repository URL (e.g. https://github.com/user/repo)');
    }

    let profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await Profile.create({ userId: req.user._id, projects: [] });
    }

    // Normalize tech stack array from string or array
    let rawTech = technologies || techStack || [];
    if (typeof rawTech === 'string') {
      rawTech = rawTech.split(',').map((t) => t.trim()).filter(Boolean);
    }

    const newProject = {
      title: title.trim(),
      description: (description || '').trim(),
      technologies: rawTech,
      techStack: rawTech,
      projectUrl: finalProjectUrl,
      liveUrl: finalProjectUrl,
      githubUrl: finalGithubUrl,
      completionDate: completionDate ? new Date(completionDate) : undefined
    };

    profile.projects.unshift(newProject);
    await profile.save();

    const createdProj = profile.projects[0];
    const completion = profile.calculateCompletion();

    res.status(201).json({
      success: true,
      message: 'Project added to portfolio',
      data: createdProj,
      completion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update portfolio project
// @route   PUT /api/profiles/projects/:projId
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    const { projId } = req.params;
    const { title, description, technologies, techStack, projectUrl, liveUrl, githubUrl, completionDate } = req.body;

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error('Profile not found');
    }

    const proj = profile.projects.id(projId);
    if (!proj) {
      res.status(404);
      throw new Error('Project record not found');
    }

    const finalProjectUrl = projectUrl !== undefined ? projectUrl.trim() : (liveUrl !== undefined ? liveUrl.trim() : proj.projectUrl);
    const finalGithubUrl = githubUrl !== undefined ? githubUrl.trim() : proj.githubUrl;

    if (finalProjectUrl && !isValidUrl(finalProjectUrl)) {
      res.status(400);
      throw new Error('Please provide a valid project URL');
    }

    if (finalGithubUrl && !isValidUrl(finalGithubUrl)) {
      res.status(400);
      throw new Error('Please provide a valid GitHub repository URL');
    }

    if (title !== undefined) proj.title = title.trim();
    if (description !== undefined) proj.description = description.trim();
    if (technologies !== undefined || techStack !== undefined) {
      let rawTech = technologies !== undefined ? technologies : techStack;
      if (typeof rawTech === 'string') {
        rawTech = rawTech.split(',').map((t) => t.trim()).filter(Boolean);
      }
      proj.technologies = rawTech;
      proj.techStack = rawTech;
    }
    proj.projectUrl = finalProjectUrl;
    proj.liveUrl = finalProjectUrl;
    proj.githubUrl = finalGithubUrl;
    if (completionDate !== undefined) {
      proj.completionDate = completionDate ? new Date(completionDate) : undefined;
    }

    await profile.save();
    const completion = profile.calculateCompletion();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: proj,
      completion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete portfolio project
// @route   DELETE /api/profiles/projects/:projId
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const { projId } = req.params;

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error('Profile not found');
    }

    const proj = profile.projects.id(projId);
    if (!proj) {
      res.status(404);
      throw new Error('Project record not found');
    }

    profile.projects.pull(projId);
    await profile.save();
    const completion = profile.calculateCompletion();

    res.status(200).json({
      success: true,
      message: 'Project removed from portfolio',
      completion
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// CERTIFICATIONS CRUD
// =========================================================================

// @desc    Add professional certification
// @route   POST /api/profiles/certifications
// @access  Private
exports.addCertification = async (req, res, next) => {
  try {
    const { name, title, issuingOrganization, issuer, issueDate, credentialId, credentialUrl } = req.body;

    const certName = (name || title || '').trim();
    const certIssuer = (issuingOrganization || issuer || '').trim();

    if (!certName) {
      res.status(400);
      throw new Error('Certification name is required');
    }

    if (!certIssuer) {
      res.status(400);
      throw new Error('Issuing organization is required');
    }

    const finalUrl = (credentialUrl || '').trim();
    if (finalUrl && !isValidUrl(finalUrl)) {
      res.status(400);
      throw new Error('Please provide a valid credential verification URL');
    }

    let profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await Profile.create({ userId: req.user._id, certifications: [] });
    }

    const newCert = {
      name: certName,
      title: certName,
      issuingOrganization: certIssuer,
      issuer: certIssuer,
      issueDate: issueDate ? new Date(issueDate) : undefined,
      credentialId: (credentialId || '').trim(),
      credentialUrl: finalUrl
    };

    profile.certifications.unshift(newCert);
    await profile.save();

    const createdCert = profile.certifications[0];
    const completion = profile.calculateCompletion();

    res.status(201).json({
      success: true,
      message: 'Certification added to profile',
      data: createdCert,
      completion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update professional certification
// @route   PUT /api/profiles/certifications/:certId
// @access  Private
exports.updateCertification = async (req, res, next) => {
  try {
    const { certId } = req.params;
    const { name, title, issuingOrganization, issuer, issueDate, credentialId, credentialUrl } = req.body;

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error('Profile not found');
    }

    const cert = profile.certifications.id(certId);
    if (!cert) {
      res.status(404);
      throw new Error('Certification record not found');
    }

    if (name !== undefined || title !== undefined) {
      const val = (name || title || '').trim();
      cert.name = val;
      cert.title = val;
    }
    if (issuingOrganization !== undefined || issuer !== undefined) {
      const org = (issuingOrganization || issuer || '').trim();
      cert.issuingOrganization = org;
      cert.issuer = org;
    }
    if (issueDate !== undefined) cert.issueDate = issueDate ? new Date(issueDate) : undefined;
    if (credentialId !== undefined) cert.credentialId = credentialId.trim();
    if (credentialUrl !== undefined) {
      const url = credentialUrl.trim();
      if (url && !isValidUrl(url)) {
        res.status(400);
        throw new Error('Please provide a valid credential verification URL');
      }
      cert.credentialUrl = url;
    }

    await profile.save();
    const completion = profile.calculateCompletion();

    res.status(200).json({
      success: true,
      message: 'Certification updated successfully',
      data: cert,
      completion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete professional certification
// @route   DELETE /api/profiles/certifications/:certId
// @access  Private
exports.deleteCertification = async (req, res, next) => {
  try {
    const { certId } = req.params;

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error('Profile not found');
    }

    const cert = profile.certifications.id(certId);
    if (!cert) {
      res.status(404);
      throw new Error('Certification record not found');
    }

    profile.certifications.pull(certId);
    await profile.save();
    const completion = profile.calculateCompletion();

    res.status(200).json({
      success: true,
      message: 'Certification removed from profile',
      completion
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// DASHBOARD STATS SUMMARY
// =========================================================================

// @desc    Get real profile statistics for student dashboard
// @route   GET /api/profiles/stats
// @access  Private
exports.getProfileStats = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI in server/.env.');
    }

    let profile = await Profile.findOne({ userId: req.user._id }).populate('userId', 'name email role');
    if (!profile) {
      profile = await Profile.create({ userId: req.user._id });
      profile = await profile.populate('userId', 'name email role');
    }

    const completion = profile.calculateCompletion(profile.userId ? profile.userId.name : req.user.name);

    // Build recent profile activity stream
    const activities = [];
    if (profile.skills && profile.skills.length > 0) {
      const latestSkill = profile.skills[profile.skills.length - 1];
      activities.push({
        type: 'skill',
        title: `Added skill: ${latestSkill.name}`,
        subtitle: `${latestSkill.category} (${latestSkill.proficiency})`,
        timestamp: latestSkill.updatedAt || latestSkill.createdAt || new Date()
      });
    }
    if (profile.projects && profile.projects.length > 0) {
      const latestProj = profile.projects[0];
      activities.push({
        type: 'project',
        title: `Added portfolio project: ${latestProj.title}`,
        subtitle: latestProj.technologies && latestProj.technologies.length > 0 ? latestProj.technologies.join(', ') : 'Web Project',
        timestamp: latestProj.updatedAt || latestProj.createdAt || new Date()
      });
    }
    if (profile.certifications && profile.certifications.length > 0) {
      const latestCert = profile.certifications[0];
      activities.push({
        type: 'certification',
        title: `Earned certification: ${latestCert.name || latestCert.title}`,
        subtitle: latestCert.issuingOrganization || latestCert.issuer || 'Industry Credential',
        timestamp: latestCert.updatedAt || latestCert.createdAt || new Date()
      });
    }

    res.status(200).json({
      success: true,
      data: {
        studentName: profile.userId ? profile.userId.name : req.user.name,
        targetRole: profile.department ? `${profile.department} Specialist` : 'Software Engineer',
        college: profile.college || 'Engineering College',
        completion,
        totalSkills: profile.skills ? profile.skills.length : 0,
        totalProjects: profile.projects ? profile.projects.length : 0,
        totalCertifications: profile.certifications ? profile.certifications.length : 0,
        totalEducation: profile.education ? profile.education.length : 0,
        recentActivity: activities
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get profile by ID (Public view)
// @route   GET /api/profiles/:id
// @access  Public / Protected
exports.getProfileById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let profile = await Profile.findById(id).populate('userId', 'name email role');
    if (!profile) {
      profile = await Profile.findOne({ userId: id }).populate('userId', 'name email role');
    }

    if (!profile) {
      res.status(404);
      throw new Error('Profile not found');
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};
