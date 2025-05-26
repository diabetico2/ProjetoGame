import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { userRoutes } from './routes/userRoutes';
import { matchRoutes } from './routes/matchRoutes';
import { GameServer } from './game/GameServer';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);

// Create HTTP server
const httpServer = createServer(app);

// Initialize game server with socket.io
new GameServer(httpServer);

// Listen on the HTTP server instead of the Express app
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 