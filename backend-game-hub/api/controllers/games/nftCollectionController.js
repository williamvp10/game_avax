const nftCollectionDao = require('@dao/nftCollectionDao');

const createNFTCollection = async (req, res) => {
  const { name, metadata, contractId } = req.body;

  try {
    const nftCollection = await nftCollectionDao.createNFTCollection({ name, metadata, contractId });
    res.status(201).json(nftCollection);
  } catch (error) {
    res.status(500).json({ error: 'Error creating NFT collection' });
  }
};

const getCollectionsByContract = async (req, res) => {
  const { contractId } = req.params;

  try {
    const collections = await nftCollectionDao.getCollectionsByContract(parseInt(contractId));
    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving collections' });
  }
};

const updateNFTCollection = async (req, res) => {
  const { collectionId } = req.params;
  const { name, metadata } = req.body;

  try {
    const nftCollection = await nftCollectionDao.updateNFTCollection(parseInt(collectionId), { name, metadata });
    res.status(200).json(nftCollection);
  } catch (error) {
    res.status(500).json({ error: 'Error updating NFT collection' });
  }
};

const deleteNFTCollection = async (req, res) => {
  const { collectionId } = req.params;

  try {
    await nftCollectionDao.deleteNFTCollection(parseInt(collectionId));
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting NFT collection' });
  }
};

module.exports = {
  createNFTCollection,
  getCollectionsByContract,
  updateNFTCollection,
  deleteNFTCollection,
};
