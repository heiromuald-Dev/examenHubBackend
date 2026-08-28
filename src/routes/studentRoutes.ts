import { Router } from 'express';
import { studentController } from '../Controller/studentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { studentValidator } from '../validators/studentValidator';

const router = Router();
router.use(authMiddleware, roleMiddleware('admin'));
router.get('/', studentController.list);
router.get('/:id', studentController.detail);
router.post('/', validationMiddleware(studentValidator.create), studentController.create);
router.put('/:id', validationMiddleware(studentValidator.update), studentController.update);
router.delete('/:id', studentController.deactivate);

export default router;
