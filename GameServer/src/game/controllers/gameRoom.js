import { clients } from '../../server.js';

class GameRoom {
    constructor(player1, player2, roomId) {
        this.roomId = roomId;
        this.players = [player1, player2];
        this.playerReadyStatus = { // Inicializa el estado de preparación de los jugadores
            [player1.socketId]: false,
            [player2.socketId]: false
        };
        this.gameState = {
            playerPositions: [
                { socketId: player1.socketId, x: -7.75, y: -1.25, z: 90, skinId: 0 },
                { socketId: player2.socketId, x: 7.75, y: -1.25, z: -90, skinId: 0 }
            ],
            playerHealth: [
                { socketId: player1.socketId, actualLive: 100, maxLive: 100 },
                { socketId: player2.socketId, actualLive: 100, maxLive: 100 }
            ],
            tower1: [
                { socketId: player1.socketId, actualLive: 300, maxLive: 300 },
                { socketId: player2.socketId, actualLive: 300, maxLive: 300 }
            ],
            tower2: [
                { socketId: player1.socketId, actualLive: 500, maxLive: 500 },
                { socketId: player2.socketId, actualLive: 500, maxLive: 500 }
            ],
            principalTower: [
                { socketId: player1.socketId, actualLive: 60, maxLive: 60 },
                { socketId: player2.socketId, actualLive: 60, maxLive: 60 }
            ]
        };
        this.setupGame();
    }

    playerReady(socketId) {
        this.playerReadyStatus[socketId] = true;
    }

    areBothPlayersReady() {
        return Object.values(this.playerReadyStatus).every(status => status === true);
    }

    startGame() {
        this.players.forEach(player => {

            // Encuentra el índice del jugador en playerPositions
            const playerIndex = this.gameState.playerPositions.findIndex(position => position.socketId === player.socketId);

            // Asegúrate de que estás actualizando la posición correcta
            if (playerIndex !== -1) {
                this.gameState.playerPositions[playerIndex].skinId = player.skinId;
                console.log("Im sending to start: " + player.socketId + " Skin: " + this.gameState.playerPositions[playerIndex].skinId);
            }

            this.sendWebSocketMessage(player.socketId, 'startFight', {
                roomId: this.roomId,
                initialPositions: this.gameState.playerPositions
            });
        });
        console.log(`Game started in room ${this.roomId}`);
    }

    setupGame() {
        this.players.forEach(player => {
            this.sendWebSocketMessage(player.socketId, 'gameStart', {
                roomId: this.roomId
            });
        });
    }

    sendWebSocketMessage(socketId, type, payload) {
        const client = clients.get(socketId);
        if (client) {
            client.send(JSON.stringify({ message: type, data: payload }));
        }
    }

    updatePlayerPosition(socketId, newPosition) {
        // Encuentra la posición del jugador en la matriz
        const playerIndex = this.gameState.playerPositions.findIndex(player => player.socketId === socketId);
        if (playerIndex !== -1) {
            // Desestructuramos newPosition y le asignamos un valor por defecto a z si no está definido
            const { x, y, z = this.gameState.playerPositions[playerIndex].z } = newPosition;

            // Actualiza la posición del jugador en la matriz
            this.gameState.playerPositions[playerIndex] = { socketId, x, y, z };
        }

        // Envía la posición actualizada a ambos jugadores
        this.players.forEach(player => {
            this.sendWebSocketMessage(player.socketId, 'updatePosition', {
                playerPositions: this.gameState.playerPositions
            });
        });
    }

    handlePlayerFire(socketId, bulletsData) {
        // Envía la información de las balas a ambos jugadores
        //console.log(bulletsData);
        this.players.forEach(player => {
            if (player.socketId != socketId) {
                this.sendWebSocketMessage(player.socketId, 'spawnBullets', {
                    shooterId: socketId,
                    bulletsData: bulletsData
                });
            }
        });
    }

    handlePlayerMineOrMinerFire(socketId, mineOrMinerData) {
        //console.log(mineOrMinerData);
        this.players.forEach(player => {
            if (player.socketId != socketId) {
                this.sendWebSocketMessage(player.socketId, 'spawnMineOrMiner', {
                    shooterId: socketId,
                    mineOrMinerData: mineOrMinerData
                });
            }
        });
    }

    updatePlayerHealth(socketId, damage) {
        const playerIndex = this.gameState.playerHealth.findIndex(player => player.socketId === socketId);

        if (playerIndex !== -1) {
            // Resta el daño de la vida actual
            this.gameState.playerHealth[playerIndex].actualLive -= damage;

            // Asegura que la vida no caiga por debajo de cero
            if (this.gameState.playerHealth[playerIndex].actualLive < 0) {
                this.gameState.playerHealth[playerIndex].actualLive = 0;
            }

            // Envía la vida actualizada a ambos jugadores
            this.players.forEach(player => {
                this.sendWebSocketMessage(player.socketId, 'updateHealth', {
                    playerHealth: this.gameState.playerHealth
                });
            });

            // Verifica si algún jugador ha perdido
            if (this.gameState.playerHealth[playerIndex].actualLive === 0) {
                this.endGame(socketId);
            }
        }
    }

    updateTowerHealth(socketId, towerType, myTowerId, damage) {
        let towerArray;
        switch (towerType) {
            case 'tower1':
                towerArray = this.gameState.tower1;
                break;
            case 'tower2':
                towerArray = this.gameState.tower2;
                break;
            case 'principalTower':
                towerArray = this.gameState.principalTower;
                break;
            default:
                console.error(`Unknown tower type: ${towerType}`);
                return;
        }
    
        // Encuentra la torre específica del jugador
        const towerIndex = towerArray.findIndex(tower => tower.socketId === socketId);
    
        if (towerIndex !== -1) {
            // Resta el daño a la vida actual de la torre
            towerArray[towerIndex].actualLive -= damage;
    
            // Asegura que la vida de la torre no caiga por debajo de cero
            if (towerArray[towerIndex].actualLive < 0) {
                towerArray[towerIndex].actualLive = 0;
            }
    
            // Envía la vida actualizada de la torre a ambos jugadores
            this.players.forEach(player => {
                this.sendWebSocketMessage(player.socketId, 'updateTowerHealth', {
                    towerType: towerType,
                    myTowerId: myTowerId,
                    towerHealth: towerArray
                });
            });
    
            // Verifica si la torre ha sido destruida
            if (towerArray[towerIndex].actualLive === 0) {
                this.handleTowerDestroyed(socketId, towerType, myTowerId);
            }
        }
    }
    
    handleTowerDestroyed(socketId, towerType, myTowerId) {
        // Aquí puedes manejar la lógica cuando una torre es destruida
        console.log(`Tower ${towerType} for player ${socketId} has been destroyed.`);
    
        // Enviar notificación a ambos jugadores
        this.players.forEach(player => {
            this.sendWebSocketMessage(player.socketId, 'towerDestroyed', {
                socketId: socketId,
                towerType: towerType,
                myTowerId: myTowerId
            });
        });
    
        // Aquí puedes agregar cualquier lógica adicional, como verificar si todas las torres han sido destruidas y finalizar el juego si es necesario
    }

    endGame(loserSocketId) {
        const winner = this.players.find(player => player.socketId !== loserSocketId);
        const loser = this.players.find(player => player.socketId === loserSocketId);

        // Envia mensaje de fin de juego a ambos jugadores
        this.players.forEach(player => {
            this.sendWebSocketMessage(player.socketId, 'gameOver', {
                winnerId: winner.socketId,
                loserId: loser.socketId
            });
        });

        console.log(`Game in room ${this.roomId} ended. Winner: ${winner.socketId}, Loser: ${loser.socketId}`);

        // Elimina la sala de juego
        this.cleanUpRoom();
    }

    cleanUpRoom() {
        gameRooms.delete(this.roomId);
        console.log(`Room ${this.roomId} has been deleted`);
    }
}

const gameRooms = new Map();

export function createGameRoom(player1, player2) {
    const roomId = `room_${Date.now()}`;
    const gameRoom = new GameRoom(player1, player2, roomId);
    gameRooms.set(roomId, gameRoom);
    return gameRoom;
}

export function getGameRoom(roomId) {
    return gameRooms.get(roomId);
}

export function handleReadyToStart(socketId, roomId) {
    const gameRoom = getGameRoom(roomId);
    if (!gameRoom) {
        console.error(`Game room with ID ${roomId} not found`);
        return;
    }

    // Marca al jugador como listo
    gameRoom.playerReady(socketId);

    // Si ambos jugadores están listos, inicia la partida
    if (gameRoom.areBothPlayersReady()) {
        gameRoom.startGame();
    }
}

export function handlePlayerFire(socketId, roomId, bulletsData) {
    const gameRoom = getGameRoom(roomId);
    if (!gameRoom) {
        console.error(`Game room with ID ${roomId} not found`);
        return;
    }

    gameRoom.handlePlayerFire(socketId, bulletsData);
}

export function handleMinerOrMarinerFire(socketId, roomId, mineOrMinerData) {
    const gameRoom = getGameRoom(roomId);
    if (!gameRoom) {
        console.error(`Game room with ID ${roomId} not found`);
        return;
    }

    gameRoom.handlePlayerMineOrMinerFire(socketId, mineOrMinerData);
}

export function handlePlayerDamage(socketId, roomId, damage) {
    const gameRoom = getGameRoom(roomId);
    if (!gameRoom) {
        console.error(`Game room with ID ${roomId} not found`);
        return;
    }

    gameRoom.updatePlayerHealth(socketId, damage);
}

export function handleTowerDamage(socketId, roomId, towerType, myTowerId, damage) {
    const gameRoom = getGameRoom(roomId);
    if (!gameRoom) {
        console.error(`Game room with ID ${roomId} not found`);
        return;
    }

    gameRoom.updateTowerHealth(socketId, towerType, myTowerId, damage);
}