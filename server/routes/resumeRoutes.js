const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  getTemplates,
  getMyResumes,
  getResumeById,
  createResume,
  updateResume,
  duplicateResume,
  deleteResume,
  exportPdf,
  uploadAndExtract,
  compareJobMatch,
  getMyAnalyses,
  getAnalysisById
} = require('../controllers/resumeController');

const { protect } = require('../middleware/authMiddleware');

// Configure Multer for in-memory file uploads with validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    if (
      allowedMimeTypes.includes(file.mimetype) ||
      file.originalname.match(/\.(pdf|docx|doc)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Please upload a PDF or Word DOCX document.'), false);
    }
  }
});

// Middleware to gracefully format multer errors
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, err => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds maximum allowed limit of 5MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    next();
  });
};

// 1. Template catalog (Public / Protected)
router.get('/templates', getTemplates);

// 2. Resume Upload & OCR/Text Extraction
router.post('/upload-extract', protect, handleUpload, uploadAndExtract);

// 3. Job-Resume Matching & Analysis History
router.post('/compare-job', protect, compareJobMatch);
router.get('/analyses/history', protect, getMyAnalyses);
router.get('/analyses/:id', protect, getAnalysisById);

// 4. Student Resume CRUD & PDF Export
router.route('/')
  .get(protect, getMyResumes)
  .post(protect, createResume);

router.route('/:id')
  .get(protect, getResumeById)
  .put(protect, updateResume)
  .delete(protect, deleteResume);

router.post('/:id/duplicate', protect, duplicateResume);
router.get('/:id/export-pdf', protect, exportPdf);

module.exports = router;
