const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const reportController = require('../controllers/report.controller');

router.get('/', auth, reportController.generateReport);

module.exports = router;
