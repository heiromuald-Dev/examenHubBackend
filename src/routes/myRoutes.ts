import { Router } from 'express';
import { myController } from '../Controller/myController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { submissionValidator } from '../validators/submissionValidator';

const router = Router();
router.use(authMiddleware, roleMiddleware('student'));
router.get('/exams', myController.availableExams);
router.get('/exams/:examId', myController.examDetail);
router.post('/exams/:examId/start', myController.startExam);
router.post('/attempts/:attemptId/submit', validationMiddleware(submissionValidator.submit), myController.submitExam);
router.get('/results', myController.results);
router.get('/attempts/:attemptId/correction', myController.correction);

export default router;
