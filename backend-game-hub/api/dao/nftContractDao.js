const prisma = require('./prismaClient');

const createNFTContract = async (data) => {
  return await prisma.nFTContract.create({
    data,
  });
};

const getNFTContractsByGame = async (gameId) => {
  return await prisma.nFTContract.findMany({
    where: { gameId },
  });
};

module.exports = {
  createNFTContract,
  getNFTContractsByGame,
};
