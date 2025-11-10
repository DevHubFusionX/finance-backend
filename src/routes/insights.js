import express from 'express';
import { validateInsightQuery } from '../middleware/validation.js';
import { getInsights, generateForecast } from '../controllers/insightController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, validateInsightQuery, getInsights);
router.post('/forecast', authenticate, generateForecast);

export default router;