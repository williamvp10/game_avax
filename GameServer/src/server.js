import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import matchmakingRouter from './matchmaking/routes/matchmakingRoutes.js';

import { handleReadyToStart, getGameRoom, handlePlayerFire, handlePlayerDamage } from './game/controllers/gameRoom.js';

//const matchmakingService = require('./matchmaking/index');

const app = express();
const server = http.createServer(app); // Crear servidor HTTP

const wss = new WebSocketServer({ server });
const clients = new Map();

wss.on('connection', (ws) => {

    const socketId = uuidv4();
    console.log(`New WebSocket client connected with ID: ${socketId}`);
    clients.set(socketId, ws);

    ws.send(JSON.stringify({ type: 'socketId', socketId }));

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        switch (parsedMessage.type) {
            case 'readyToStart':
                handleReadyToStart(socketId, parsedMessage.roomId);
                break;
            case 'updatePosition':
                const gameRoom = getGameRoom(parsedMessage.roomId);
                if (gameRoom)
                    gameRoom.updatePlayerPosition(socketId, { x: parsedMessage.x, y: parsedMessage.y, z: parsedMessage.z });
                break;
            case 'fireBullets':
                handlePlayerFire(parsedMessage.socketId, parsedMessage.roomId, parsedMessage.data);
                break;
            case 'playerDamage':
                handlePlayerDamage(parsedMessage.socketId, parsedMessage.roomId, parsedMessage.damage);
                break;
            default:
                console.log(`Received unhandled message type: ${parsedMessage.type}`);
                break;
        }
    });

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        clients.delete(socketId);
    });
});

const PORT = process.env.PORT || 3000;

// Configurar middlewares y rutas
app.use(express.json());
app.use('/api/matchmaking', matchmakingRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the Multiplayer Game Server');
});

export { wss, clients };

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));