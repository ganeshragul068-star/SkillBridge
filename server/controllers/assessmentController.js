const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const { evaluateProficiency, getProficiencyFeedback } = require('../utils/proficiencyEvaluator');

// Helper to strip correct answers and explanations from questions for student consumption
const sanitizeQuestionsForStudent = (questions) => {
  return questions.map((q, idx) => ({
    _id: q._id,
    questionIndex: idx,
    questionText: q.questionText,
    options: q.options,
    marks: q.marks || 1
  }));
};

// @desc    Get all active assessments (sanitized: no correct answers or explanations)
// @route   GET /api/assessments
// @access  Public / Protected
exports.getAssessments = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const { skill, category, difficulty, search } = req.query;
    const query = { isActive: true };

    if (skill) {
      query.skill = { $regex: skill.trim(), $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { skill: searchRegex },
        { description: searchRegex }
      ];
    }

    const assessments = await Assessment.find(query).sort({ createdAt: -1 });

    // Sanitize questions so correct answers and explanations are NEVER exposed
    const sanitized = assessments.map((a) => {
      const totalMarks = a.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
      return {
        _id: a._id,
        title: a.title,
        skill: a.skill,
        category: a.category || 'Programming Languages',
        difficulty: a.difficulty || 'Intermediate',
        description: a.description,
        duration: a.duration,
        passingScore: a.passingScore,
        totalQuestions: a.questions.length,
        totalMarks,
        createdAt: a.createdAt
      };
    });

    res.status(200).json({
      success: true,
      count: sanitized.length,
      data: sanitized
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assessment for starting test (sanitized questions without answer keys)
// @route   GET /api/assessments/:id
// @access  Public / Protected
exports.getAssessmentById = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid assessment ID format');
    }

    const assessment = await Assessment.findById(req.params.id);

    if (!assessment || !assessment.isActive) {
      res.status(404);
      throw new Error('Assessment not found or inactive');
    }

    const totalMarks = assessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    res.status(200).json({
      success: true,
      data: {
        _id: assessment._id,
        title: assessment.title,
        skill: assessment.skill,
        category: assessment.category,
        difficulty: assessment.difficulty,
        description: assessment.description,
        duration: assessment.duration,
        passingScore: assessment.passingScore,
        totalQuestions: assessment.questions.length,
        totalMarks,
        questions: sanitizeQuestionsForStudent(assessment.questions)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start an assessment attempt (initializes timer & attempt session in MongoDB)
// @route   POST /api/assessments/:id/start
// @access  Private (Student)
exports.startAssessment = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid assessment ID');
    }

    const assessment = await Assessment.findById(id);
    if (!assessment || !assessment.isActive) {
      res.status(404);
      throw new Error('Assessment not found or unavailable');
    }

    // Count previous completed attempts for attemptNumber
    const previousAttemptsCount = await AssessmentResult.countDocuments({
      studentId: req.user._id,
      assessmentId: assessment._id,
      status: 'completed'
    });

    const durationMinutes = assessment.duration || 20;
    const startTime = new Date();
    const expiresAt = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    // Create active attempt document
    const attempt = await AssessmentResult.create({
      studentId: req.user._id,
      assessmentId: assessment._id,
      status: 'in-progress',
      startTime,
      expiresAt,
      attemptNumber: previousAttemptsCount + 1,
      totalMarks: assessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0),
      answers: []
    });

    res.status(201).json({
      success: true,
      message: 'Assessment attempt session initialized',
      data: {
        attemptId: attempt._id,
        assessmentId: assessment._id,
        title: assessment.title,
        skill: assessment.skill,
        category: assessment.category,
        difficulty: assessment.difficulty,
        durationMinutes,
        startTime,
        expiresAt,
        attemptNumber: attempt.attemptNumber,
        totalQuestions: assessment.questions.length,
        totalMarks: attempt.totalMarks,
        passingScore: assessment.passingScore,
        questions: sanitizeQuestionsForStudent(assessment.questions)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active assessment attempt details & sanitized questions
// @route   GET /api/assessment-attempts/:id
// @access  Private (Student)
exports.getAssessmentAttempt = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid attempt ID format');
    }

    const attempt = await AssessmentResult.findById(id).populate('assessmentId');
    if (!attempt) {
      res.status(404);
      throw new Error('Assessment attempt session not found');
    }

    // Ownership check: student cannot inspect another student's attempt
    if (attempt.studentId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied: You cannot view another student’s assessment attempt');
    }

    const assessment = attempt.assessmentId;
    const now = new Date();
    const isExpired = attempt.expiresAt && now > attempt.expiresAt;

    res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        status: attempt.status,
        startTime: attempt.startTime,
        expiresAt: attempt.expiresAt,
        isExpired,
        attemptNumber: attempt.attemptNumber,
        assessment: {
          _id: assessment._id,
          title: assessment.title,
          skill: assessment.skill,
          duration: assessment.duration,
          passingScore: assessment.passingScore,
          questions: sanitizeQuestionsForStudent(assessment.questions)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assessment attempt, perform backend-only scoring & persist result
// @route   POST /api/assessment-attempts/:id/submit
// @access  Private (Student)
exports.submitAssessmentAttempt = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const { id } = req.params;
    const { answers, timeSpentSeconds = 0 } = req.body; // Array of { questionIndex, selectedAnswer }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid attempt ID format');
    }

    const attempt = await AssessmentResult.findById(id);
    if (!attempt) {
      res.status(404);
      throw new Error('Assessment attempt not found');
    }

    // Strict ownership verification
    if (attempt.studentId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Security Violation: You cannot submit answers for another student’s attempt');
    }

    // Prevent duplicate submission of the same attempt
    if (attempt.status === 'completed') {
      res.status(400);
      throw new Error('This assessment attempt has already been submitted and scored.');
    }

    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment) {
      res.status(404);
      throw new Error('Associated assessment no longer exists');
    }

    let score = 0;
    let totalMarks = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const gradedAnswers = [];

    // Backend-only grading: Compare submitted answers with stored answer keys
    assessment.questions.forEach((q, idx) => {
      const marks = q.marks || 1;
      totalMarks += marks;

      const studentResponse = Array.isArray(answers)
        ? answers.find((a) => a.questionIndex === idx || (a.questionId && a.questionId.toString() === q._id.toString()))
        : null;

      const selectedAnswer = studentResponse && studentResponse.selectedAnswer !== undefined && studentResponse.selectedAnswer !== null
        ? Number(studentResponse.selectedAnswer)
        : -1;

      const isCorrect = selectedAnswer === q.correctAnswer;
      let marksAwarded = 0;

      if (selectedAnswer === -1) {
        unansweredCount++;
      } else if (isCorrect) {
        score += marks;
        marksAwarded = marks;
        correctCount++;
      } else {
        incorrectCount++;
      }

      // Store comprehensive review snapshot (accessible ONLY after submission)
      gradedAnswers.push({
        questionIndex: idx,
        selectedAnswer,
        isCorrect,
        marksAwarded,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || ''
      });
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const passed = percentage >= assessment.passingScore;
    const proficiencyLevel = evaluateProficiency(percentage);
    const feedback = getProficiencyFeedback(proficiencyLevel, assessment.skill);

    // Update attempt document to completed
    attempt.status = 'completed';
    attempt.score = score;
    attempt.totalMarks = totalMarks;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.proficiencyLevel = proficiencyLevel;
    attempt.correctCount = correctCount;
    attempt.incorrectCount = incorrectCount;
    attempt.unansweredCount = unansweredCount;
    attempt.timeSpentSeconds = Number(timeSpentSeconds) || 0;
    attempt.endTime = new Date();
    attempt.completedAt = new Date();
    attempt.answers = gradedAnswers;

    await attempt.save();

    res.status(200).json({
      success: true,
      message: passed ? 'Assessment Passed! Verified competency recorded.' : 'Assessment Completed.',
      data: {
        resultId: attempt._id,
        assessmentId: assessment._id,
        title: assessment.title,
        skill: assessment.skill,
        score,
        totalMarks,
        percentage,
        passingScore: assessment.passingScore,
        passed,
        proficiencyLevel,
        feedback,
        correctCount,
        incorrectCount,
        unansweredCount,
        timeSpentSeconds: attempt.timeSpentSeconds,
        attemptNumber: attempt.attemptNumber,
        completedAt: attempt.completedAt,
        answers: gradedAnswers // Full review snapshot returned safely post-submission
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Direct assessment submission (backward compatibility for Phase 2/3 test suites)
// @route   POST /api/assessments/:id/submit
// @access  Private (Student)
exports.submitAssessment = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      res.status(400);
      throw new Error('Answers must be provided as an array of user responses');
    }

    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      res.status(404);
      throw new Error('Assessment not found');
    }

    let score = 0;
    let totalMarks = 0;
    const gradedAnswers = [];

    assessment.questions.forEach((q, idx) => {
      const marks = q.marks || 1;
      totalMarks += marks;

      const studentResponse = answers.find(
        (a) => a.questionIndex === idx || (a.questionId && a.questionId.toString() === q._id.toString())
      );

      const selectedAnswer = studentResponse ? studentResponse.selectedAnswer : -1;
      const isCorrect = selectedAnswer === q.correctAnswer;

      if (isCorrect) {
        score += marks;
      }

      gradedAnswers.push({
        questionIndex: idx,
        selectedAnswer,
        isCorrect,
        marksAwarded: isCorrect ? marks : 0,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || ''
      });
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const passed = percentage >= assessment.passingScore;
    const proficiencyLevel = evaluateProficiency(percentage);

    const result = await AssessmentResult.create({
      studentId: req.user._id,
      assessmentId: assessment._id,
      status: 'completed',
      score,
      totalMarks,
      percentage,
      passed,
      proficiencyLevel,
      answers: gradedAnswers,
      completedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: passed ? 'Assessment Passed! Badge earned.' : 'Assessment Completed.',
      data: {
        resultId: result._id,
        assessmentTitle: assessment.title,
        skill: assessment.skill,
        score,
        totalMarks,
        percentage,
        passingScore: assessment.passingScore,
        passed,
        proficiencyLevel,
        completedAt: result.completedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's completed assessment history with proficiency ratings
// @route   GET /api/assessment-results/my
// @access  Private (Student)
exports.getMyAssessmentResults = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const results = await AssessmentResult.find({
      studentId: req.user._id,
      status: 'completed'
    })
      .populate('assessmentId', 'title skill category difficulty passingScore')
      .sort({ completedAt: -1 })
      .lean();

    // Group by skill for historical proficiency analysis
    const skillHistoryMap = {};
    results.forEach((r) => {
      const skill = r.assessmentId?.skill || 'General';
      if (!skillHistoryMap[skill]) {
        skillHistoryMap[skill] = [];
      }
      skillHistoryMap[skill].push(r);
    });

    const summary = {
      totalAssessmentsTaken: results.length,
      passedCount: results.filter((r) => r.passed).length,
      failedCount: results.filter((r) => !r.passed).length,
      averageScore: results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
        : 0,
      verifiedSkills: Object.keys(skillHistoryMap).filter((skill) =>
        skillHistoryMap[skill].some((r) => r.passed)
      )
    };

    res.status(200).json({
      success: true,
      count: results.length,
      summary,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed result by ID (includes question-by-question review & explanations)
// @route   GET /api/assessment-results/:id
// @access  Private (Student & Admin)
exports.getAssessmentResultById = async (req, res, next) => {
  try {
    if (process.env.DATA_MODE === 'mongodb' && mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error('Database is offline. Please configure MONGO_URI.');
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid result ID format');
    }

    const result = await AssessmentResult.findById(id).populate('assessmentId');
    if (!result) {
      res.status(404);
      throw new Error('Assessment result not found');
    }

    // Ownership check: Student can only view their own result; Admins can view any
    if (req.user.role !== 'admin' && result.studentId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied: You cannot inspect another student’s result');
    }

    const feedback = getProficiencyFeedback(result.proficiencyLevel, result.assessmentId?.skill || 'Technical');

    // Fetch previous completed attempts for the same assessment to provide comparison
    const targetAssessmentId = result.assessmentId?._id || result.assessmentId;
    const allStudentAttempts = await AssessmentResult.find({
      studentId: result.studentId,
      status: 'completed'
    })
      .sort({ completedAt: -1 })
      .lean();

    const attemptsForThisAssessment = allStudentAttempts.filter(
      (a) => (a.assessmentId?._id || a.assessmentId || '').toString() === targetAssessmentId.toString() &&
             a._id.toString() !== result._id.toString()
    );

    let previousAttempt = null;
    let comparison = null;

    if (attemptsForThisAssessment.length > 0) {
      previousAttempt = attemptsForThisAssessment[0];
      const scoreDelta = (result.percentage || 0) - (previousAttempt.percentage || 0);
      comparison = {
        hasPreviousAttempt: true,
        previousAttemptNumber: previousAttempt.attemptNumber,
        previousPercentage: previousAttempt.percentage,
        previousProficiencyLevel: previousAttempt.proficiencyLevel,
        scoreDelta,
        trend: scoreDelta > 0 ? 'improved' : (scoreDelta < 0 ? 'declined' : 'steady'),
        summary: scoreDelta > 0
          ? `Score improved by +${scoreDelta}% compared to attempt #${previousAttempt.attemptNumber}.`
          : (scoreDelta < 0 ? `Score dropped by ${scoreDelta}% compared to attempt #${previousAttempt.attemptNumber}.` : `Score remained identical to attempt #${previousAttempt.attemptNumber}.`)
      };
    } else {
      comparison = {
        hasPreviousAttempt: false,
        summary: 'This is the student’s baseline attempt for this assessment.'
      };
    }

    res.status(200).json({
      success: true,
      data: {
        ...result.toObject(),
        feedback,
        comparison,
        previousAttempts: attemptsForThisAssessment
      }
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------------
// ADMIN ASSESSMENT MANAGEMENT
// -------------------------------------------------------------

// @desc    Admin: Create a new skill assessment with questions, options, and answer keys
// @route   POST /api/admin/assessments
// @access  Private (Admin)
exports.createAssessment = async (req, res, next) => {
  try {
    const {
      title,
      skill,
      category = 'Programming Languages',
      difficulty = 'Intermediate',
      description,
      duration = 20,
      passingScore = 70,
      questions
    } = req.body;

    if (!title || !skill || !description || !Array.isArray(questions) || questions.length === 0) {
      res.status(400);
      throw new Error('Please provide title, skill, description, and at least 1 question.');
    }

    // Validate each question
    questions.forEach((q, idx) => {
      if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2 || q.correctAnswer === undefined) {
        res.status(400);
        throw new Error(`Question #${idx + 1} must include text, at least 2 options, and a valid correctAnswer index.`);
      }
    });

    const assessment = await Assessment.create({
      title: title.trim(),
      skill: skill.trim(),
      category,
      difficulty,
      description: description.trim(),
      duration: Number(duration) || 20,
      passingScore: Number(passingScore) || 70,
      questions,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update assessment details or active state
// @route   PUT /api/admin/assessments/:id
// @access  Private (Admin)
exports.updateAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid assessment ID format');
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      res.status(404);
      throw new Error('Assessment not found');
    }

    const { title, skill, category, difficulty, description, duration, passingScore, isActive, questions } = req.body;

    if (title) assessment.title = title.trim();
    if (skill) assessment.skill = skill.trim();
    if (category) assessment.category = category;
    if (difficulty) assessment.difficulty = difficulty;
    if (description) assessment.description = description.trim();
    if (duration !== undefined) assessment.duration = Number(duration);
    if (passingScore !== undefined) assessment.passingScore = Number(passingScore);
    if (isActive !== undefined) assessment.isActive = Boolean(isActive);
    if (Array.isArray(questions)) assessment.questions = questions;

    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'Assessment updated successfully',
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete assessment
// @route   DELETE /api/admin/assessments/:id
// @access  Private (Admin)
exports.deleteAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid assessment ID');
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      res.status(404);
      throw new Error('Assessment not found');
    }

    await assessment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get assessment evaluation metrics & student pass statistics
// @route   GET /api/admin/assessments/stats
// @access  Private (Admin)
exports.getAssessmentStats = async (req, res, next) => {
  try {
    const totalAssessments = await Assessment.countDocuments();
    const activeAssessments = await Assessment.countDocuments({ isActive: true });
    const allResults = await AssessmentResult.find({ status: 'completed' }).lean();

    const totalAttempts = allResults.length;
    const passedAttempts = allResults.filter((r) => r.passed).length;
    const overallPassRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalAssessments,
        activeAssessments,
        totalAttempts,
        passedAttempts,
        overallPassRate
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Add question to an assessment
// @route   POST /api/admin/assessments/:id/questions
// @access  Private (Admin)
exports.addQuestionToAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionText, options, correctAnswer, explanation, marks = 1 } = req.body;

    if (!questionText || !Array.isArray(options) || options.length < 2 || correctAnswer === undefined) {
      res.status(400);
      throw new Error('Please provide questionText, at least 2 options, and correctAnswer index.');
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      res.status(404);
      throw new Error('Assessment not found');
    }

    const newQuestion = {
      questionText: questionText.trim(),
      options,
      correctAnswer: Number(correctAnswer),
      explanation: (explanation || '').trim(),
      marks: Number(marks) || 1
    };

    assessment.questions.push(newQuestion);
    await assessment.save();

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Edit question in an assessment
// @route   PUT /api/admin/assessments/:id/questions/:questionId
// @access  Private (Admin)
exports.updateQuestionInAssessment = async (req, res, next) => {
  try {
    const { id, questionId } = req.params;
    const { questionText, options, correctAnswer, explanation, marks } = req.body;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      res.status(404);
      throw new Error('Assessment not found');
    }

    const q = assessment.questions.id ? assessment.questions.id(questionId) : assessment.questions.find((x) => x._id.toString() === questionId.toString());
    if (!q) {
      res.status(404);
      throw new Error('Question not found');
    }

    if (questionText) q.questionText = questionText.trim();
    if (Array.isArray(options)) q.options = options;
    if (correctAnswer !== undefined) q.correctAnswer = Number(correctAnswer);
    if (explanation !== undefined) q.explanation = explanation.trim();
    if (marks !== undefined) q.marks = Number(marks);

    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete question from an assessment
// @route   DELETE /api/admin/assessments/:id/questions/:questionId
// @access  Private (Admin)
exports.deleteQuestionFromAssessment = async (req, res, next) => {
  try {
    const { id, questionId } = req.params;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      res.status(404);
      throw new Error('Assessment not found');
    }

    if (assessment.questions.length <= 1) {
      res.status(400);
      throw new Error('Cannot delete question: Assessment must retain at least 1 question.');
    }

    if (typeof assessment.questions.pull === 'function') {
      assessment.questions.pull(questionId);
    } else {
      assessment.questions = assessment.questions.filter((q) => q._id.toString() !== questionId.toString());
    }

    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'Question removed from assessment successfully',
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Toggle assessment active/inactive state
// @route   PATCH /api/admin/assessments/:id/toggle-status
// @access  Private (Admin)
exports.toggleAssessmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findById(id);
    if (!assessment) {
      res.status(404);
      throw new Error('Assessment not found');
    }

    assessment.isActive = !assessment.isActive;
    await assessment.save();

    res.status(200).json({
      success: true,
      message: `Assessment ${assessment.isActive ? 'activated' : 'deactivated'} successfully`,
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: View student assessment submissions
// @route   GET /api/admin/assessments/results
// @access  Private (Admin)
exports.getAdminAssessmentResults = async (req, res, next) => {
  try {
    const { assessmentId, studentId, skill } = req.query;
    const query = { status: 'completed' };

    if (assessmentId) query.assessmentId = assessmentId;
    if (studentId) query.studentId = studentId;

    const results = await AssessmentResult.find(query)
      .populate('studentId', 'name email college')
      .populate('assessmentId', 'title skill category difficulty passingScore')
      .sort({ completedAt: -1 })
      .lean();

    let filtered = results;
    if (skill) {
      filtered = results.filter((r) => r.assessmentId && r.assessmentId.skill && r.assessmentId.skill.toLowerCase().includes(skill.toLowerCase()));
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    next(error);
  }
};
