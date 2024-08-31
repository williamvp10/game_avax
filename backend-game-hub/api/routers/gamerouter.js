const express = require('express');
const gameController = require('@controllers/games/gameController');
const nftController = require('@controllers/games/nftController');
const userController = require('@controllers/games/userController');
const tokenController = require('@controllers/games/tokenController');

const router = express.Router();

// Rutas para la gestión de usuarios
router.post('/users', userController.createUser);
router.get('/users/:userId', userController.getUserById);
router.get('/users/wallet/:wallet', userController.getUserByWallet);
router.put('/users/:userId', userController.updateUser);
router.delete('/users/:userId', userController.deleteUser);

// Rutas para la gestión de juegos
router.post('/games', gameController.createGame);
router.get('/users/:userId/games', gameController.getGamesByUser);
router.put('/games/:gameId', gameController.updateGame);
router.delete('/games/:gameId', gameController.deleteGame);

// Rutas para la gestión de tokens
router.post('/tokens', tokenController.createToken);
router.get('/games/:gameId/tokens', tokenController.getTokensByGame);
router.put('/tokens/:tokenId', tokenController.updateToken);
router.delete('/tokens/:tokenId', tokenController.deleteToken);

// Rutas para la gestión de contratos y colecciones NFT
router.post('/nft-contracts', nftController.createNFTContract);
router.post('/nft-collections', nftController.createNFTCollection);
router.get('/nft-contracts/:contractId/collections', nftController.getCollectionsByContract);
router.put('/nft-collections/:collectionId', nftController.updateNFTCollection);
router.delete('/nft-collections/:collectionId', nftController.deleteNFTCollection);

module.exports = router;

