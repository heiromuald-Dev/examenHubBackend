import { Router } from 'express';
import { questionController } from '../Controller/questionController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { questionValidator } from '../validators/questionValidator';

const router = Router();
router.use(authMiddleware, roleMiddleware('admin'));
router.put('/:id', validationMiddleware(questionValidator.update), questionController.update);
router.delete('/:id', questionController.remove);

export default router;
