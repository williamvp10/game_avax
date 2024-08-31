const prisma = require('./prismaClient');

const createToken = async (data) => {
  return await prisma.token.create({
    data,
  });
};

const getTokensByGame = async (gameId) => {
  return await prisma.token.findMany({
    where: { gameId },
  });
};

const updateToken = async (tokenId, data) => {
  return await prisma.token.update({
    where: { id: tokenId },
    data,
  });
};

const deleteToken = async (tokenId) => {
  return await prisma.token.delete({
    where: { id: tokenId },
  });
};

module.exports = {
  createToken,
  getTokensByGame,
  updateToken,
  deleteToken,
};
