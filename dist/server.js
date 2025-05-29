"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const PacmanGameServer_1 = require("./game/PacmanGameServer");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Log de requisições estáticas
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Servir arquivos estáticos do diretório raiz
app.use(express_1.default.static(path_1.default.join(__dirname, '..'), {
    setHeaders: (res, filePath) => {
        // Configurar headers apropriados para imagens
        if (filePath.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'public, max-age=3600');
        }
    }
}));
// Rota específica para o jogo
app.get('/pacman-game.html', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '..', 'pacman-game.html'));
});
// Create HTTP server
const httpServer = (0, http_1.createServer)(app);
// Initialize game server with socket.io
new PacmanGameServer_1.PacmanGameServer(httpServer);
// Listen on the HTTP server instead of the Express app
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Serving static files from: ${path_1.default.join(__dirname, '..')}`);
});
