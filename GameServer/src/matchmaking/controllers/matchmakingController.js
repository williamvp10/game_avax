import { wss, clients } from '../../server.js';
import { createGameRoom } from '../../game/controllers/gameRoom.js';

let matchmakingQueue = [];

export function addPlayerToQueue(player, socketId, skinId, walletAddress) {
    player.socketId = socketId;  // Asociar el ID de socket con el jugador
    player.skinId = skinId;
    player.walletAddress = walletAddress
    console.log("New socket received: " + player.socketId + " With skin: " + player.skinId + " With Address: " + player.walletAddress);
    matchmakingQueue.push(player);
    return matchPlayers();
}

const matchPlayers = async () => {
    if (matchmakingQueue.length < 2) {
        return null;
    }

    // Ordenar jugadores por número de copas y nivel para mejorar el emparejamiento
    matchmakingQueue.sort((a, b) => b.cups - a.cups || b.level - a.level);

    const player1 = matchmakingQueue.shift();
    const player2 = matchmakingQueue.shift();

    if (Math.abs(player1.cups - player2.cups) <= 100 && Math.abs(player1.level - player2.level) <= 5) {
        const gameRoom = await createGameRoom(player1, player2);
        //gameRoom.setupGame();

        return { player1, player2 };
    }

    matchmakingQueue.unshift(player2); // Devuelve el segundo jugador si no hay match
    return null;
};

// Función para enviar mensajes a través de WebSocket
const sendWebSocketMessage = (socketId, type, payload) => {
    const client = clients.get(socketId);
    if (client) {
        client.send(JSON.stringify({ message: type }));
    }
};