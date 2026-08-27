import { Router } from 'express';
import examRoutes from './examRoutes';

const router = Router();

router.use('/exams', examRoutes);

export default router;
