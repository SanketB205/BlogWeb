import express from 'express';
import { register, login, getMe, getUserProfile, toggleFollow, getFollowers, getFollowing, googleLogin } from '../controllers/auth_controller.js';
import { authMiddleware } from '../middleware/auth_middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', authMiddleware, getMe);
router.get('/users/:userId', getUserProfile);
router.post('/users/:userId/follow', authMiddleware, toggleFollow);
router.get('/users/:userId/followers', getFollowers);
router.get('/users/:userId/following', getFollowing);

export default router;
