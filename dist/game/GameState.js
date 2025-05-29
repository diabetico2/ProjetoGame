"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStateManager = void 0;
class GameStateManager {
    constructor() {
        this.gameState = {
            players: new Map(),
            enemies: new Map()
        };
    }
    updatePlayerPosition(playerId, position) {
        this.gameState.players.set(playerId, { id: playerId, position });
    }
    updateEnemyPosition(enemyId, position) {
        this.gameState.enemies.set(enemyId, { id: enemyId, position });
    }
    validateCollision(collision) {
        const player = this.gameState.players.get(collision.playerId);
        const enemy = this.gameState.enemies.get(collision.enemyId);
        if (!player || !enemy) {
            return false;
        }
        // Calculate distance between reported positions
        const distance = Math.sqrt(Math.pow(collision.playerPosition.x - collision.enemyPosition.x, 2) +
            Math.pow(collision.playerPosition.y - collision.enemyPosition.y, 2));
        // Validate if the positions match the stored state (with some tolerance for latency)
        const positionTolerance = 5; // Adjust this value based on your game's needs
        const playerPositionValid = Math.abs(player.position.x - collision.playerPosition.x) < positionTolerance &&
            Math.abs(player.position.y - collision.playerPosition.y) < positionTolerance;
        const enemyPositionValid = Math.abs(enemy.position.x - collision.enemyPosition.x) < positionTolerance &&
            Math.abs(enemy.position.y - collision.enemyPosition.y) < positionTolerance;
        // Define collision threshold based on your game's collision detection requirements
        const collisionThreshold = 50; // Adjust this value based on your game's needs
        return playerPositionValid && enemyPositionValid && distance < collisionThreshold;
    }
    getGameState() {
        return this.gameState;
    }
    getState() {
        return this.gameState;
    }
    removePlayer(playerId) {
        this.gameState.players.delete(playerId);
    }
}
exports.GameStateManager = GameStateManager;
