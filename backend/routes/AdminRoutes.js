const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

// Add your admin routes here
router.post('/login', AdminController.loginAdmin);

module.exports = router;