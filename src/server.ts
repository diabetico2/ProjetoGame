import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { PacmanGameServer } from './game/PacmanGameServer';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Log de requisições estáticas
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Servir arquivos estáticos do diretório raiz
app.use(express.static(path.join(__dirname, '..'), {
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
  res.sendFile(path.join(__dirname, '..', 'pacman-game.html'));
});

// Create HTTP server
const httpServer = createServer(app);

// Initialize game server with socket.io
new PacmanGameServer(httpServer);

// Listen on the HTTP server instead of the Express app
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, '..')}`);
}); 