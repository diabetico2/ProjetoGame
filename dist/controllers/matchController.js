"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerTopMatches = exports.getPlayerMatchHistory = exports.getOverallRanking = exports.getDailyRanking = exports.createMatch = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Criar uma nova partida
const createMatch = async (req, res) => {
    try {
        const { score } = req.body;
        const userId = req.userId;
        if (!score || typeof score !== 'number') {
            res.status(400).json({ error: 'Score válido é obrigatório' });
            return;
        }
        const match = await prisma.match.create({
            data: {
                score,
                userId
            }
        });
        res.status(201).json(match);
    }
    catch (error) {
        console.error('Erro ao criar partida:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.createMatch = createMatch;
// Ranking de um dia específico
const getDailyRanking = async (req, res) => {
    try {
        const date = req.query.date ? new Date(req.query.date) : new Date();
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        const dailyRanking = await prisma.match.findMany({
            where: {
                playedAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: {
                user: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                score: 'desc'
            }
        });
        res.json(dailyRanking);
    }
    catch (error) {
        console.error('Erro ao buscar ranking diário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getDailyRanking = getDailyRanking;
// Ranking geral (melhor partida de cada jogador)
const getOverallRanking = async (req, res) => {
    try {
        const overallRanking = await prisma.user.findMany({
            include: {
                matches: {
                    orderBy: {
                        score: 'desc'
                    },
                    take: 1
                }
            }
        });
        const formattedRanking = overallRanking
            .map(user => {
            var _a, _b;
            return ({
                userId: user.id,
                name: user.name,
                bestScore: ((_a = user.matches[0]) === null || _a === void 0 ? void 0 : _a.score) || 0,
                matchDate: ((_b = user.matches[0]) === null || _b === void 0 ? void 0 : _b.playedAt) || null
            });
        })
            .sort((a, b) => b.bestScore - a.bestScore);
        res.json(formattedRanking);
    }
    catch (error) {
        console.error('Erro ao buscar ranking geral:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getOverallRanking = getOverallRanking;
// Histórico de partidas de um jogador
const getPlayerMatchHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const matches = await prisma.match.findMany({
            where: {
                userId: parseInt(userId)
            },
            orderBy: {
                playedAt: 'desc'
            }
        });
        res.json(matches);
    }
    catch (error) {
        console.error('Erro ao buscar histórico de partidas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getPlayerMatchHistory = getPlayerMatchHistory;
// Top 10 partidas de um jogador
const getPlayerTopMatches = async (req, res) => {
    try {
        const { userId } = req.params;
        const topMatches = await prisma.match.findMany({
            where: {
                userId: parseInt(userId)
            },
            orderBy: {
                score: 'desc'
            },
            take: 10
        });
        res.json(topMatches);
    }
    catch (error) {
        console.error('Erro ao buscar top 10 partidas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getPlayerTopMatches = getPlayerTopMatches;
