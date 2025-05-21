const express = require('express');
const router = express.Router();
const multer = require('multer');
const ocrController = require('../controllers/ocrController');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Routes
router.post('/process', upload.single('file'), ocrController.processDocument);
router.get('/history', ocrController.getHistory);
router.get('/result/:id', ocrController.getResult);

module.exports = router;