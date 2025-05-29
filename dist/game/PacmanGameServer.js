"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacmanGameServer = void 0;
const socket_io_1 = require("socket.io");
class PacmanGameServer {
    constructor(httpServer) {
        this.players = new Map();
        this.waitingPlayers = [];
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            },
            pingTimeout: 10000,
            pingInterval: 5000
        });
        this.gameState = {
            pacman: { x: 1, y: 1, direction: 0 },
            ghost: { x: 23, y: 1, direction: 2 },
            score: 0,
            gameMap: this.initializeGameMap()
        };
        this.setupSocketHandlers();
    }
    initializeGameMap() {
        return [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1],
            [1, 2, 1, 0, 1, 2, 1, 0, 0, 1, 2, 1, 2, 1, 0, 0, 1, 2, 1, 0, 0, 0, 1, 2, 1],
            [1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1],
            [1, 2, 1, 0, 1, 2, 1, 2, 1, 0, 0, 0, 0, 0, 1, 2, 1, 2, 1, 0, 0, 0, 1, 2, 1],
            [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1],
            [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1],
            [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1],
            [1, 2, 1, 0, 1, 2, 1, 0, 0, 1, 2, 1, 2, 1, 0, 0, 1, 2, 1, 0, 0, 0, 1, 2, 1],
            [1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`Player connected: ${socket.id}`);
            this.waitingPlayers.push(socket.id);
            if (this.waitingPlayers.length === 1) {
                this.players.set(socket.id, 'pacman');
                socket.emit('game:role', 'pacman');
            }
            else if (this.waitingPlayers.length === 2) {
                this.players.set(socket.id, 'ghost');
                socket.emit('game:role', 'ghost');
                this.startGame();
            }
            socket.on('pacman:move', (data) => {
                if (this.players.get(socket.id) === 'pacman') {
                    this.gameState.pacman = data;
                    socket.broadcast.emit('pacman:update', data);
                    this.checkCollision();
                }
            });
            socket.on('ghost:move', (data) => {
                if (this.players.get(socket.id) === 'ghost') {
                    this.gameState.ghost = data;
                    socket.broadcast.emit('ghost:update', data);
                    this.checkCollision();
                }
            });
            socket.on('dot:collected', (data) => {
                if (this.players.get(socket.id) === 'pacman') {
                    this.gameState.gameMap[data.y][data.x] = 0;
                    this.gameState.score += 10;
                    this.io.emit('dot:update', data);
                    this.checkWinCondition();
                }
            });
            socket.on('disconnect', () => {
                console.log(`Player disconnected: ${socket.id}`);
                this.players.delete(socket.id);
                this.waitingPlayers = this.waitingPlayers.filter(id => id !== socket.id);
                if (this.players.size < 2) {
                    this.io.emit('game:over', 'Jogador desconectado');
                    this.resetGame();
                }
            });
        });
    }
    startGame() {
        this.io.emit('game:start', this.gameState);
    }
    checkCollision() {
        const dx = this.gameState.pacman.x - this.gameState.ghost.x;
        const dy = this.gameState.pacman.y - this.gameState.ghost.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 1) {
            this.io.emit('game:over', 'Fantasma');
            this.resetGame();
        }
    }
    checkWinCondition() {
        let remainingDots = 0;
        for (let row of this.gameState.gameMap) {
            remainingDots += row.filter(tile => tile === 2).length;
        }
        if (remainingDots === 0) {
            this.io.emit('game:over', 'Pacman');
            this.resetGame();
        }
    }
    resetGame() {
        this.gameState = {
            pacman: { x: 1, y: 1, direction: 0 },
            ghost: { x: 23, y: 1, direction: 2 },
            score: 0,
            gameMap: this.initializeGameMap()
        };
        this.players.clear();
        this.waitingPlayers = [];
    }
}
exports.PacmanGameServer = PacmanGameServer;
