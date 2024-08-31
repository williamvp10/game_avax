const prisma = require('./prismaClient');

const createNFTCollection = async (data) => {
  return await prisma.nFTCollection.create({
    data,
  });
};

const getCollectionsByContract = async (contractId) => {
  return await prisma.nFTCollection.findMany({
    where: { contractId },
  });
};

const updateNFTCollection = async (collectionId, data) => {
  return await prisma.nFTCollection.update({
    where: { id: collectionId },
    data,
  });
};

const deleteNFTCollection = async (collectionId) => {
  return await prisma.nFTCollection.delete({
    where: { id: collectionId },
  });
};

module.exports = {
  createNFTCollection,
  getCollectionsByContract,
  updateNFTCollection,
  deleteNFTCollection,
};
