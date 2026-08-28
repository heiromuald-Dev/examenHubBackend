import { Router } from 'express';
import authRoutes from './authRoutes';
import courseRoutes from './courseRoutes';
import examRoutes from './examRoutes';
import groupRoutes from './groupRoutes';
import myRoutes from './myRoutes';
import questionRoutes from './questionRoutes';
import studentRoutes from './studentRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/exams', examRoutes);
router.use('/groups', groupRoutes);
router.use('/my', myRoutes);
router.use('/questions', questionRoutes);
router.use('/students', studentRoutes);

export default router;
