"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerTopMatches = exports.getPlayerMatchHistory = exports.getOverallRanking = exports.getDailyRanking = exports.createMatch = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Função auxiliar para converter DD/MM/YYYY para Date
const convertDateFormat = (dateStr) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
};
// Criar uma nova partida
const createMatch = async (req, res) => {
    try {
        const { score } = req.body;
        const userId = req.userId;
        if (!score || typeof score !== 'number') {
            res.status(400).json({ error: 'Score válido é obrigatório' });
            return;
        }
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        const match = await prisma.match.create({
            data: {
                score,
                userId: userId
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
        let date;
        if (req.query.date && typeof req.query.date === 'string') {
            try {
                date = convertDateFormat(req.query.date);
                if (isNaN(date.getTime())) {
                    res.status(400).json({ error: 'Data inválida. Use o formato DD/MM/YYYY' });
                    return;
                }
            }
            catch (error) {
                res.status(400).json({ error: 'Data inválida. Use o formato DD/MM/YYYY' });
                return;
            }
        }
        else {
            date = new Date();
        }
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
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
        // Formatando a resposta para incluir a data no formato brasileiro
        const formattedRanking = {
            data: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`,
            ranking: dailyRanking.map(match => ({
                posicao: dailyRanking.indexOf(match) + 1,
                nomeJogador: match.user.name,
                pontuacao: match.score,
                horario: new Date(match.playedAt).toLocaleTimeString('pt-BR')
            }))
        };
        res.json(formattedRanking);
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
            var _a;
            return ({
                idJogador: user.id,
                nome: user.name,
                melhorPontuacao: ((_a = user.matches[0]) === null || _a === void 0 ? void 0 : _a.score) || 0,
                dataPartida: user.matches[0]
                    ? new Date(user.matches[0].playedAt).toLocaleDateString('pt-BR')
                    : null
            });
        })
            .sort((a, b) => b.melhorPontuacao - a.melhorPontuacao)
            .map((player, index) => (Object.assign({ posicao: index + 1 }, player)));
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
        const formattedMatches = matches.map(match => ({
            id: match.id,
            pontuacao: match.score,
            dataHora: new Date(match.playedAt).toLocaleString('pt-BR'),
            idJogador: match.userId
        }));
        res.json(formattedMatches);
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
        const formattedMatches = topMatches.map((match, index) => ({
            posicao: index + 1,
            id: match.id,
            pontuacao: match.score,
            dataHora: new Date(match.playedAt).toLocaleString('pt-BR'),
            idJogador: match.userId
        }));
        res.json(formattedMatches);
    }
    catch (error) {
        console.error('Erro ao buscar top 10 partidas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getPlayerTopMatches = getPlayerTopMatches;
