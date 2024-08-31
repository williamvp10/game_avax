const prisma = require('./prismaClient');

const createGame = async (data) => {
  return await prisma.game.create({
    data,
  });
};

const getGamesByUser = async (userId) => {
  return await prisma.game.findMany({
    where: { userId },
  });
};

const updateGame = async (gameId, data) => {
  return await prisma.game.update({
    where: { id: gameId },
    data,
  });
};

const deleteGame = async (gameId) => {
  return await prisma.game.delete({
    where: { id: gameId },
  });
};

module.exports = {
  createGame,
  getGamesByUser,
  updateGame,
  deleteGame,
};
