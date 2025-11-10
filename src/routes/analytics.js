import express from 'express';
import { getAnalytics, getSpendingTrends } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/', getAnalytics);
router.get('/trends', getSpendingTrends);

export default router;