import express from 'express';
import {
  generateReport,
  getReportHistory,
  getQuickReport
} from '../controllers/reportController.js';

const router = express.Router();

router.post('/generate', generateReport);
router.get('/history', getReportHistory);
router.get('/quick', getQuickReport);

export default router;