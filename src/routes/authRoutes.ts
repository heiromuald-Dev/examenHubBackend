import { Router } from 'express';
import { authController } from '../Controller/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { authValidator } from '../validators/authValidator';

const router = Router();
router.post('/login', validationMiddleware(authValidator.login), authController.login);
router.get('/me', authMiddleware, authController.me);
router.put('/me/profile', authMiddleware, validationMiddleware(authValidator.profile), authController.updateProfile);
router.put('/me/password', authMiddleware, validationMiddleware(authValidator.password), authController.changePassword);

export default router;
