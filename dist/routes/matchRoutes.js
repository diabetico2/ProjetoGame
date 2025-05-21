"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const matchController_1 = require("../controllers/matchController");
const router = (0, express_1.Router)();
exports.matchRoutes = router;
// Rotas de Ranking
router.get('/ranking/daily', matchController_1.getDailyRanking);
router.get('/ranking/overall', matchController_1.getOverallRanking);
// Rotas de Histórico
router.get('/history/:userId', matchController_1.getPlayerMatchHistory);
router.get('/top/:userId', matchController_1.getPlayerTopMatches);
// Rota para criar uma nova partida
router.post('/', auth_1.authenticateToken, matchController_1.createMatch);
