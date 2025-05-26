import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { GameStateManager, Position, Collision } from './GameState';

export class GameServer {
  private io: SocketServer;
  private gameState: GameStateManager;

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    this.gameState = new GameStateManager();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Player connected: ${socket.id}`);

      // Handle player position updates
      socket.on('player:position', (position: Position) => {
        this.gameState.updatePlayerPosition(socket.id, position);
        // Broadcast the position to all other players
        socket.broadcast.emit('player:position:update', {
          id: socket.id,
          position
        });
      });

      // Handle enemy position updates
      socket.on('enemy:position', (data: { enemyId: string, position: Position }) => {
        this.gameState.updateEnemyPosition(data.enemyId, data.position);
        // Broadcast the enemy position to all players
        this.io.emit('enemy:position:update', {
          id: data.enemyId,
          position: data.position
        });
      });

      // Handle collision events
      socket.on('collision:detect', (collision: Collision) => {
        const isValid = this.gameState.validateCollision(collision);
        // Emit the validation result back to the client
        socket.emit('collision:validate', {
          collisionId: `${collision.playerId}-${collision.enemyId}-${collision.timestamp}`,
          isValid
        });

        if (isValid) {
          // Broadcast valid collision to all players
          this.io.emit('collision:confirmed', collision);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        // You might want to remove the player from the game state
        // and notify other players
      });
    });
  }
} 