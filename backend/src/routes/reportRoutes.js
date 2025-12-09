import express from 'express';
import { REPORTCONTROLLER } from '../controllers/reportController.js';
import { isAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// User route - gửi tố cáo (cần đăng nhập)
router.post('/', isAuth, REPORTCONTROLLER.createReport);

// Admin routes
router.get('/', isAuth, REPORTCONTROLLER.getReports);
router.get('/count-pending', isAuth, REPORTCONTROLLER.countPending);
router.get('/:id', isAuth, REPORTCONTROLLER.getReportById);
router.put('/:id', isAuth, REPORTCONTROLLER.updateReport);
router.delete('/:id', isAuth, REPORTCONTROLLER.deleteReport);

export default router;
