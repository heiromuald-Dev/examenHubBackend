import { Router } from 'express';
import { courseController } from '../Controller/courseController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { courseValidator } from '../validators/courseValidator';

const router = Router();
router.use(authMiddleware, roleMiddleware('admin'));
router.get('/', courseController.list);
router.post('/', validationMiddleware(courseValidator.createOrUpdate), courseController.create);
router.put('/:id', validationMiddleware(courseValidator.createOrUpdate), courseController.update);
router.delete('/:id', courseController.remove);

export default router;
