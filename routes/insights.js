const express = require('express');
const InsightsController = require('../controllers/insights.controller');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, InsightsController.getInsights);

module.exports = router;