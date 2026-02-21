import express from 'express';
import {
    getPosts,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    getRelatedPosts,
    toggleLike,
    getUserPosts,
    incrementShare,
    getTrendingPosts
} from '../controllers/post_controller.js';
import { authMiddleware } from '../middleware/auth_middleware.js';

const router = express.Router();



router.get('/', getPosts);
router.get('/trending', getTrendingPosts);
router.get('/user/:userId', getUserPosts);
router.get('/:id/related', getRelatedPosts);
router.get('/:slug', getPostBySlug);

// Protected routes
router.post('/', authMiddleware, createPost);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);
router.post('/:slug/like', authMiddleware, toggleLike);
router.post('/:slug/share', incrementShare);

export default router;
