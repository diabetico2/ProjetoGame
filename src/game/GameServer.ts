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
      },
      pingTimeout: 10000,
      pingInterval: 5000
    });
    this.gameState = new GameStateManager();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Player connected: ${socket.id}`);

      // Enviar estado inicial do jogo para o novo jogador
      socket.emit('game:initial_state', this.gameState.getState());

      // Handle player position updates
      socket.on('player:position', (position: Position) => {
        try {
          this.gameState.updatePlayerPosition(socket.id, position);
          // Broadcast the position to all other players
          socket.broadcast.emit('player:position:update', {
            id: socket.id,
            position
          });
        } catch (error) {
          console.error('Error updating player position:', error);
          socket.emit('error', { message: 'Error updating position' });
        }
      });

      // Handle enemy position updates
      socket.on('enemy:position', (data: { enemyId: string, position: Position }) => {
        try {
          this.gameState.updateEnemyPosition(data.enemyId, data.position);
          // Broadcast the enemy position to all players
          this.io.emit('enemy:position:update', {
            id: data.enemyId,
            position: data.position
          });
        } catch (error) {
          console.error('Error updating enemy position:', error);
          socket.emit('error', { message: 'Error updating enemy position' });
        }
      });

      // Handle collision events
      socket.on('collision:detect', (collision: Collision) => {
        try {
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
        } catch (error) {
          console.error('Error validating collision:', error);
          socket.emit('error', { message: 'Error validating collision' });
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`Player disconnected: ${socket.id}, reason: ${reason}`);
        try {
          this.gameState.removePlayer(socket.id);
          // Notify other players about the disconnection
          socket.broadcast.emit('player:disconnected', { id: socket.id });
        } catch (error) {
          console.error('Error handling disconnection:', error);
        }
      });
    });

    // Monitor server-wide events
    this.io.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }
} 