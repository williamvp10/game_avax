const express = require('express');
const fortuneController = require('@controllers/seaoffortune/fortunecontroller');

const router = express.Router();

// Rutas para la gestión de usuarios
router.post('/seaoffortune/create-room', fortuneController.createRoom);
router.post('/seaoffortune/register-tower-destruction', fortuneController.registerTowerDestruction);
router.post('/seaoffortune/declare-winner', fortuneController.declareWinner);

module.exports = router;

