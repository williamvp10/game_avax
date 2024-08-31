const tokenDao = require('@dao/tokenDao');

const createToken = async (req, res) => {
  const { name, symbol, supply, address, gameId } = req.body;

  try {
    const token = await tokenDao.createToken({ name, symbol, supply, address, gameId });
    res.status(201).json(token);
  } catch (error) {
    res.status(500).json({ error: 'Error creating token' });
  }
};

const getTokensByGame = async (req, res) => {
  const { gameId } = req.params;

  try {
    const tokens = await tokenDao.getTokensByGame(parseInt(gameId));
    res.status(200).json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving tokens' });
  }
};

const updateToken = async (req, res) => {
  const { tokenId } = req.params;
  const { name, symbol, supply } = req.body;

  try {
    const token = await tokenDao.updateToken(parseInt(tokenId), { name, symbol, supply });
    res.status(200).json(token);
  } catch (error) {
    res.status(500).json({ error: 'Error updating token' });
  }
};

const deleteToken = async (req, res) => {
  const { tokenId } = req.params;

  try {
    await tokenDao.deleteToken(parseInt(tokenId));
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting token' });
  }
};

module.exports = {
  createToken,
  getTokensByGame,
  updateToken,
  deleteToken,
};
