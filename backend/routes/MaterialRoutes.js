const express = require('express');
const router = express.Router();
const MaterialController = require('../controllers/MaterialController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('materialFile'), MaterialController.uploadMaterial);
router.get('/course/:courseId', MaterialController.getMaterialsByCourse);
router.get('/download/:materialId', MaterialController.downloadMaterial);

module.exports = router;