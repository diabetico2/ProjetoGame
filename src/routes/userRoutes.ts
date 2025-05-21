import { Router, RequestHandler } from 'express';
import { createUser, getUserInfo } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', createUser as RequestHandler);
router.get('/me', authenticateToken as RequestHandler, getUserInfo as RequestHandler);

export { router as userRoutes }; 