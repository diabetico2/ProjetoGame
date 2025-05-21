import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getDailyRanking,
  getOverallRanking,
  getPlayerMatchHistory,
  getPlayerTopMatches,
  createMatch
} from '../controllers/matchController';

const router = Router();

// Rotas de Ranking
router.get('/ranking/daily', getDailyRanking as RequestHandler);
router.get('/ranking/overall', getOverallRanking as RequestHandler);

// Rotas de Histórico
router.get('/history/:userId', getPlayerMatchHistory as RequestHandler);
router.get('/top/:userId', getPlayerTopMatches as RequestHandler);

// Rota para criar uma nova partida
router.post('/', authenticateToken as RequestHandler, createMatch as RequestHandler);

export { router as matchRoutes }; 