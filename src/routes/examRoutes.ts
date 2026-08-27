import { Router } from 'express';
import { examController } from '../Controller/examController';
import { resultController } from '../Controller/resultController';
import { questionController } from '../Controller/questionController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { examValidator } from '../validators/examValidator';
import { questionValidator } from '../validators/questionValidator';

const router = Router();
router.use(authMiddleware, roleMiddleware('admin'));
router.get('/', examController.list);
router.post('/', validationMiddleware(examValidator.create), examController.create);
router.get('/:examId/questions', questionController.list);
router.post('/:examId/questions', validationMiddleware(questionValidator.create), questionController.create);
router.get('/:examId/results', resultController.adminSummary);
router.get('/:id', examController.get);
router.put('/:id', validationMiddleware(examValidator.update), examController.update);
router.delete('/:id', examController.remove);

export default router;
