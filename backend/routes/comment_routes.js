import express from 'express';
import { getComments, addComment, deleteComment } from '../controllers/comment_controller.js';
import { authMiddleware } from '../middleware/auth_middleware.js';

const router = express.Router({ mergeParams: true });

// GET /posts/:postId/comments
router.get('/', getComments);
// POST /posts/:postId/comments  (protected)
router.post('/', authMiddleware, addComment);
// DELETE /posts/:postId/comments/:commentId  (protected)
router.delete('/:commentId', authMiddleware, deleteComment);

export default router;
