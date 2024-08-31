const express = require('express');
const matchmakingRoutes = require('./routes/matchmakingRoutes');

const matchmakingService = express();
matchmakingService.use(express.json());
matchmakingService.use('/api/matchmaking', matchmakingRoutes);

module.exports = matchmakingService;