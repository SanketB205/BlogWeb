import express from 'express';
import { register, login, getMe, getUserProfile, toggleFollow } from '../controllers/auth_controller.js';
import { authMiddleware } from '../middleware/auth_middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.get('/users/:userId', getUserProfile);
router.post('/users/:userId/follow', authMiddleware, toggleFollow);

export default router;
